<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Payment;
use App\Services\SSLCommerzService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function __construct(
        private readonly SSLCommerzService $sslcommerz,
    ) {}

    /**
     * Get payment details for an appointment (authenticated patient only).
     */
    public function paymentDetails(string $appointmentId, Request $request): JsonResponse
    {
        $appointment = $this->findAppointmentForPatient($request->user(), $appointmentId);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointmentId' => ['Appointment not found or you are not authorized to view it.'],
            ]);
        }

        $appointment->loadMissing(['doctor.user', 'doctor.primaryHospital', 'doctor.hospitals', 'hospital', 'payment']);

        $amount = $this->appointmentAmount($appointment);
        $payment = $appointment->payment;

        return response()->json([
            'appointment' => [
                'id' => (string) $appointment->appointment_no,
                'doctor' => [
                    'name' => $appointment->doctor?->user?->name ?? 'Unknown Doctor',
                    'specialty' => $appointment->doctor?->specialty ?? 'General Medicine',
                ],
                'appointmentDate' => $appointment->appointment_date?->toDateString() ?? (string) $appointment->appointment_date,
                'slotTime' => $this->displayTime($appointment->start_time),
                'consultationType' => $appointment->consultation_type,
                'paymentStatus' => $appointment->payment_status,
                'amountCents' => $amount,
                'currency' => 'BDT',
            ],
            'payment' => $payment ? [
                'transactionNo' => $payment->transaction_no,
                'status' => $payment->status,
                'amount' => (float) $payment->total_amount,
                'currency' => $payment->currency,
            ] : null,
        ]);
    }

    /**
     * Initialize an SSLCOMMERZ payment session.
     */
    public function initialize(Request $request): JsonResponse
    {
        $data = $request->validate([
            'appointment_id' => ['required', 'string'],
        ]);

        $user = $request->user();
        $appointment = $this->findAppointmentForPatient($user, $data['appointment_id']);

        if (! $appointment) {
            throw ValidationException::withMessages([
                'appointment_id' => ['Appointment not found or you are not authorized to pay for it.'],
            ]);
        }

        $appointment->loadMissing(['doctor.user', 'patient.user', 'hospital', 'payment']);

        // Prevent duplicate successful payments.
        if ($appointment->payment_status === 'paid') {
            throw ValidationException::withMessages([
                'appointment_id' => ['This appointment has already been paid.'],
            ]);
        }

        if (! $this->sslcommerz->isConfigured()) {
            Log::error('SSLCOMMERZ is not configured. Add SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD to .env');

            return response()->json([
                'success' => false,
                'message' => 'Payment gateway is not configured. Please contact support.',
            ], 500);
        }

        $amount = $this->appointmentAmount($appointment);

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'appointment_id' => ['The consultation fee for this appointment is invalid.'],
            ]);
        }

        $amountDecimal = $amount / 100;
        $transactionId = $this->newTransactionId($appointment->appointment_no);

        // Create or update the payment record (pending).
        $payment = Payment::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'transaction_no' => $transactionId,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'hospital_id' => $appointment->hospital_id,
                'payer_user_id' => $user?->id,
                'provider' => 'sslcommerz',
                'method' => 'online',
                'currency' => 'BDT',
                'amount' => $amountDecimal,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $amountDecimal,
                'paid_amount' => 0,
                'due_amount' => $amountDecimal,
                'status' => 'pending',
                'gateway' => 'sslcommerz',
                'gateway_transaction_id' => null,
                'gateway_response' => null,
                'paid_at' => null,
            ],
        );

        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');
        $apiBase = rtrim((string) config('app.url', 'http://localhost:3001'), '/');

        $successUrl = config('sslcommerz.success_url', '')
            ?: $apiBase.'/api/payments/sslcommerz/success';
        $failUrl = config('sslcommerz.fail_url', '')
            ?: $apiBase.'/api/payments/sslcommerz/fail';
        $cancelUrl = config('sslcommerz.cancel_url', '')
            ?: $apiBase.'/api/payments/sslcommerz/cancel';
        $ipnUrl = config('sslcommerz.ipn_url', '')
            ?: $apiBase.'/api/payments/sslcommerz/ipn';

        $patient = $appointment->patient;
        $patientUser = $patient?->user;

        $result = $this->sslcommerz->initialize([
            'total_amount' => $amountDecimal,
            'currency' => 'BDT',
            'tran_id' => $transactionId,
            'success_url' => $successUrl,
            'fail_url' => $failUrl,
            'cancel_url' => $cancelUrl,
            'ipn_url' => $ipnUrl,
            'cus_name' => $patientUser?->name ?? 'Patient',
            'cus_email' => $patientUser?->email ?? '',
            'cus_add1' => $patient?->address_line1 ?? '',
            'cus_city' => $patient?->city ?? '',
            'cus_state' => $patient?->state ?? '',
            'cus_postcode' => $patient?->postal_code ?? '',
            'cus_country' => $patient?->country ?? 'Bangladesh',
            'cus_phone' => $patientUser?->phone ?? '',
            'product_name' => 'Appointment Consultation - '.($appointment->doctor?->user?->name ?? 'Doctor'),
            'product_category' => 'Healthcare',
            'product_profile' => 'general',
            'num_of_item' => 1,
            'shipping_method' => 'NO',
        ]);

        if (! $result['success']) {
            // Mark the payment as failed so the user can retry.
            $payment->forceFill([
                'status' => 'failed',
                'gateway_response' => $result['data'] ?? null,
            ])->save();

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Could not initialize the payment.',
            ], 422);
        }

        // Store the gateway session data.
        $payment->forceFill([
            'status' => 'processing',
            'gateway_response' => $result['data'] ?? null,
        ])->save();

        return response()->json([
            'success' => true,
            'transaction_id' => $transactionId,
            'gateway_url' => $result['gateway_url'],
        ]);
    }

    /**
     * SSLCOMMERZ success callback.
     */
    public function success(Request $request): \Illuminate\Http\RedirectResponse
    {
        $tranId = (string) $request->input('tran_id', '');
        $valId = (string) $request->input('val_id', '');

        if ($tranId === '' || $valId === '') {
            return $this->redirectToFrontend('/Payment/payment-failed', 'Missing transaction data.');
        }

        $payment = Payment::query()->where('transaction_no', $tranId)->first();

        if (! $payment) {
            Log::warning('SSLCOMMERZ success callback for unknown transaction', ['tran_id' => $tranId]);

            return $this->redirectToFrontend('/Payment/payment-failed', 'Transaction not found.');
        }

        // Prevent duplicate processing.
        if ($payment->status === 'paid') {
            return $this->redirectToFrontend('/Payment/payment-success?transaction_id='.urlencode($tranId));
        }

        $appointment = $payment->appointment;

        if (! $appointment) {
            return $this->redirectToFrontend('/Payment/payment-failed', 'Appointment not found.');
        }

        $expectedAmount = (float) $payment->total_amount;
        $expectedCurrency = (string) $payment->currency;

        // Validate the transaction with SSLCOMMERZ before marking as paid.
        $validation = $this->sslcommerz->validateTransaction($valId, $expectedAmount, $expectedCurrency);

        if (! $validation['valid']) {
            Log::warning('SSLCOMMERZ validation failed for transaction', [
                'tran_id' => $tranId,
                'message' => $validation['message'] ?? '',
            ]);

            $payment->forceFill([
                'status' => 'failed',
                'gateway_transaction_id' => $valId,
                'gateway_response' => $validation['data'] ?? null,
            ])->save();

            return $this->redirectToFrontend('/Payment/payment-failed', $validation['message'] ?? 'Payment validation failed.');
        }

        // Use a database transaction to update both payment and appointment atomically.
        DB::transaction(function () use ($payment, $appointment, $valId, $validation): void {
            $payment->forceFill([
                'status' => 'paid',
                'gateway_transaction_id' => $valId,
                'gateway_response' => $validation['data'] ?? null,
                'paid_amount' => $payment->total_amount,
                'due_amount' => 0,
                'paid_at' => now(),
            ])->save();

            $appointment->forceFill([
                'payment_status' => 'paid',
            ])->save();
        });

        return $this->redirectToFrontend('/Payment/payment-success?transaction_id='.urlencode($tranId));
    }

    /**
     * SSLCOMMERZ fail callback.
     */
    public function fail(Request $request): \Illuminate\Http\RedirectResponse
    {
        $tranId = (string) $request->input('tran_id', '');

        if ($tranId !== '') {
            $payment = Payment::query()->where('transaction_no', $tranId)->first();

            if ($payment && $payment->status !== 'paid') {
                $payment->forceFill([
                    'status' => 'failed',
                    'gateway_response' => $request->all(),
                ])->save();

                if ($payment->appointment) {
                    $payment->appointment->forceFill([
                        'payment_status' => 'failed',
                    ])->save();
                }
            }
        }

        return $this->redirectToFrontend('/Payment/payment-failed');
    }

    /**
     * SSLCOMMERZ cancel callback.
     */
    public function cancel(Request $request): \Illuminate\Http\RedirectResponse
    {
        $tranId = (string) $request->input('tran_id', '');

        if ($tranId !== '') {
            $payment = Payment::query()->where('transaction_no', $tranId)->first();

            if ($payment && $payment->status !== 'paid') {
                $payment->forceFill([
                    'status' => 'cancelled',
                    'gateway_response' => $request->all(),
                ])->save();

                if ($payment->appointment) {
                    $payment->appointment->forceFill([
                        'payment_status' => 'unpaid',
                    ])->save();
                }
            }
        }

        return $this->redirectToFrontend('/Payment/payment-cancelled');
    }

    /**
     * SSLCOMMERZ IPN callback (optional, for server-to-server notifications).
     */
    public function ipn(Request $request): JsonResponse
    {
        $tranId = (string) $request->input('tran_id', '');
        $valId = (string) $request->input('val_id', '');

        if ($tranId === '' || $valId === '') {
            return response()->json(['success' => false, 'message' => 'Missing transaction data.'], 422);
        }

        $payment = Payment::query()->where('transaction_no', $tranId)->first();

        if (! $payment || $payment->status === 'paid') {
            return response()->json(['success' => true]);
        }

        $appointment = $payment->appointment;

        if (! $appointment) {
            return response()->json(['success' => false, 'message' => 'Appointment not found.'], 404);
        }

        $validation = $this->sslcommerz->validateTransaction(
            $valId,
            (float) $payment->total_amount,
            (string) $payment->currency,
        );

        if (! $validation['valid']) {
            return response()->json(['success' => false, 'message' => 'Validation failed.'], 422);
        }

        DB::transaction(function () use ($payment, $appointment, $valId, $validation): void {
            $payment->forceFill([
                'status' => 'paid',
                'gateway_transaction_id' => $valId,
                'gateway_response' => $validation['data'] ?? null,
                'paid_amount' => $payment->total_amount,
                'due_amount' => 0,
                'paid_at' => now(),
            ])->save();

            $appointment->forceFill([
                'payment_status' => 'paid',
            ])->save();
        });

        return response()->json(['success' => true]);
    }

    private function findAppointmentForPatient(?\Illuminate\Contracts\Auth\Authenticatable $user, string $appointmentId): ?Appointment
    {
        if (! $user instanceof \App\Models\User) {
            return null;
        }

        $patient = $user->patient;

        if (! $patient) {
            return null;
        }

        return Appointment::query()
            ->with(['doctor.user', 'doctor.primaryHospital', 'doctor.hospitals', 'hospital', 'payment'])
            ->where('appointment_no', $appointmentId)
            ->where('patient_id', $patient->id)
            ->first();
    }

    private function appointmentAmount(Appointment $appointment): int
    {
        if ($appointment->payment) {
            return (int) round(((float) $appointment->payment->total_amount) * 100);
        }

        return (int) round(((float) ($appointment->doctor?->consultation_fee ?? 0)) * 100);
    }

    private function newTransactionId(string $appointmentNo): string
    {
        do {
            $id = 'APPOINTMENT_'.preg_replace('/[^A-Za-z0-9]/', '', $appointmentNo).'_'.Str::upper(Str::random(6));
        } while (Payment::query()->where('transaction_no', $id)->exists());

        return $id;
    }

    private function displayTime(?string $time): string
    {
        if (! $time) {
            return '';
        }

        return \Illuminate\Support\Carbon::createFromFormat('H:i:s', $time)->format('h:i A');
    }

    private function redirectToFrontend(string $path, ?string $message = null): \Illuminate\Http\RedirectResponse
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');
        $url = $frontendUrl.$path;

        if ($message) {
            $url .= (str_contains($url, '?') ? '&' : '?').'message='.urlencode($message);
        }

        return redirect()->away($url);
    }
}