<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Payment;
use App\Library\SslCommerz\SslCommerzNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SslCommerzPaymentController extends Controller
{
    /**
     * Hosted Checkout - Redirect to SSLCOMMERZ gateway.
     *
     * POST /pay
     * Body: { appointment_id: string }
     */
    public function index(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|string',
        ]);

        $appointment = Appointment::with(['patient', 'patient.user', 'doctor', 'payment'])
            ->where('appointment_no', $request->appointment_id)
            ->first();

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found.',
            ], 404);
        }

        // Check if already paid
        if ($appointment->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'This appointment has already been paid.',
            ], 422);
        }

        // Get or create payment record
        $payment = $appointment->payment;
        if (!$payment) {
            $payment = Payment::create([
                'transaction_no' => $this->generateTransactionNo(),
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'hospital_id' => $appointment->hospital_id,
                'payer_user_id' => $appointment->patient?->user_id,
                'provider' => 'sslcommerz',
                'method' => 'hosted',
                'currency' => 'BDT',
                'amount' => $appointment->doctor?->consultation_fee ?? 0,
                'total_amount' => $appointment->doctor?->consultation_fee ?? 0,
                'paid_amount' => 0,
                'due_amount' => $appointment->doctor?->consultation_fee ?? 0,
                'status' => 'Pending',
                'gateway' => 'sslcommerz',
            ]);
        }

        // Prepare SSLCommerz payment data
        $post_data = $this->prepareSslCommerzData($appointment, $payment);

        // Initiate payment
        $sslc = new SslCommerzNotification();
        $payment_options = $sslc->makePayment($post_data, 'hosted');

        if (!is_array($payment_options)) {
            return response()->json([
                'success' => false,
                'message' => 'Could not initialize payment gateway.',
            ], 500);
        }

        // Update payment with gateway response
        $payment->update([
            'gateway_response' => $payment_options,
        ]);

        return response()->json([
            'success' => true,
            'gateway_url' => $payment_options['gateway_url'] ?? null,
            'payment' => $payment,
        ]);
    }

    /**
     * Pay via AJAX (EasyCheckout Popup).
     *
     * POST /pay-via-ajax
     * Body: { appointment_id: string }
     */
    public function payViaAjax(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|string',
        ]);

        $appointment = Appointment::with(['patient', 'patient.user', 'doctor', 'payment'])
            ->where('appointment_no', $request->appointment_id)
            ->first();

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found.',
            ], 404);
        }

        // Check if already paid
        if ($appointment->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'This appointment has already been paid.',
            ], 422);
        }

        // Get or create payment record
        $payment = $appointment->payment;
        if (!$payment) {
            $payment = Payment::create([
                'transaction_no' => $this->generateTransactionNo(),
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'hospital_id' => $appointment->hospital_id,
                'payer_user_id' => $appointment->patient?->user_id,
                'provider' => 'sslcommerz',
                'method' => 'ajax',
                'currency' => 'BDT',
                'amount' => $appointment->doctor?->consultation_fee ?? 0,
                'total_amount' => $appointment->doctor?->consultation_fee ?? 0,
                'paid_amount' => 0,
                'due_amount' => $appointment->doctor?->consultation_fee ?? 0,
                'status' => 'Pending',
                'gateway' => 'sslcommerz',
            ]);
        }

        // Prepare SSLCommerz payment data
        $post_data = $this->prepareSslCommerzData($appointment, $payment);

        // Initiate payment
        $sslc = new SslCommerzNotification();
        $payment_options = $sslc->makePayment($post_data, 'checkout');

        if (!is_array($payment_options)) {
            return response()->json([
                'success' => false,
                'message' => 'Could not initialize payment gateway.',
            ], 500);
        }

        // Update payment with gateway response
        $payment->update([
            'gateway_response' => $payment_options,
        ]);

        return response()->json([
            'success' => true,
            'gateway_url' => $payment_options['gateway_url'] ?? null,
            'payment' => $payment,
        ]);
    }

    public function payViaAjax(Request $request)
    {

        # Here you have to receive all the order data to initate the payment.
        # Lets your oder trnsaction informations are saving in a table called "orders"
        # In orders table order uniq identity is "transaction_id","status" field contain status of the transaction, "amount" is the order amount to be paid and "currency" is for storing Site Currency which will be checked with paid currency.

        $post_data = array();
        $post_data['total_amount'] = '10'; # You cant not pay less than 10
        $post_data['currency'] = "BDT";
        $post_data['tran_id'] = uniqid(); // tran_id must be unique

        # CUSTOMER INFORMATION
        $post_data['cus_name'] = 'Customer Name';
        $post_data['cus_email'] = 'customer@mail.com';
        $post_data['cus_add1'] = 'Customer Address';
        $post_data['cus_add2'] = "";
        $post_data['cus_city'] = "";
        $post_data['cus_state'] = "";
        $post_data['cus_postcode'] = "";
        $post_data['cus_country'] = "Bangladesh";
        $post_data['cus_phone'] = '8801XXXXXXXXX';
        $post_data['cus_fax'] = "";

        # SHIPMENT INFORMATION
        $post_data['ship_name'] = "Store Test";
        $post_data['ship_add1'] = "Dhaka";
        $post_data['ship_add2'] = "Dhaka";
        $post_data['ship_city'] = "Dhaka";
        $post_data['ship_state'] = "Dhaka";
        $post_data['ship_postcode'] = "1000";
        $post_data['ship_phone'] = "";
        $post_data['ship_country'] = "Bangladesh";

        $post_data['shipping_method'] = "NO";
        $post_data['product_name'] = "Computer";
        $post_data['product_category'] = "Goods";
        $post_data['product_profile'] = "physical-goods";

        # OPTIONAL PARAMETERS
        $post_data['value_a'] = "ref001";
        $post_data['value_b'] = "ref002";
        $post_data['value_c'] = "ref003";
        $post_data['value_d'] = "ref004";


        #Before  going to initiate the payment order status need to update as Pending.
        $update_product = DB::table('orders')
            ->where('transaction_id', $post_data['tran_id'])
            ->updateOrInsert([
                'name' => $post_data['cus_name'],
                'email' => $post_data['cus_email'],
                'phone' => $post_data['cus_phone'],
                'amount' => $post_data['total_amount'],
                'status' => 'Pending',
                'address' => $post_data['cus_add1'],
                'transaction_id' => $post_data['tran_id'],
                'currency' => $post_data['currency']
            ]);

        $sslc = new SslCommerzNotification();
        # initiate(Transaction Data , false: Redirect to SSLCOMMERZ gateway/ true: Show all the Payement gateway here )
        $payment_options = $sslc->makePayment($post_data, 'checkout', 'json');

        if (!is_array($payment_options)) {
            print_r($payment_options);
            $payment_options = array();
        }

    }

    /**
     * Payment Success Callback.
     *
     * POST /success
     */
    public function success(Request $request)
    {
        $tran_id = $request->input('tran_id');

        if (!$tran_id) {
            return response()->json(['success' => false, 'message' => 'Transaction ID missing.'], 400);
        }

        $payment = Payment::where('gateway_transaction_id', $tran_id)
            ->orWhere('transaction_no', $tran_id)
            ->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment record not found.'], 404);
        }

        if ($payment->status === 'Pending' || $payment->status === 'Processing') {
            $sslc = new SslCommerzNotification();
            $validation = $sslc->orderValidate(
                $request->all(),
                $tran_id,
                $payment->total_amount,
                $payment->currency
            );

            if ($validation == TRUE) {
                $this->markPaymentAsPaid($payment, $request->all());
                return response()->json(['success' => true, 'message' => 'Payment completed successfully.']);
            }

            return response()->json(['success' => false, 'message' => 'Payment validation failed.'], 422);
        }

        if ($payment->status === 'Completed' || $payment->status === 'Paid') {
            return response()->json(['success' => true, 'message' => 'Payment already completed.']);
        }

        return response()->json(['success' => false, 'message' => 'Invalid payment status.'], 422);
    }

    /**
     * Payment Failed Callback.
     *
     * POST /fail
     */
    public function fail(Request $request)
    {
        $tran_id = $request->input('tran_id');

        if (!$tran_id) {
            return response()->json(['success' => false, 'message' => 'Transaction ID missing.'], 400);
        }

        $payment = Payment::where('gateway_transaction_id', $tran_id)
            ->orWhere('transaction_no', $tran_id)
            ->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment record not found.'], 404);
        }

        if ($payment->status === 'Pending' || $payment->status === 'Processing') {
            $payment->update([
                'status' => 'Failed',
                'gateway_response' => $request->all(),
            ]);
            return response()->json(['success' => false, 'message' => 'Payment failed.']);
        }

        return response()->json(['success' => false, 'message' => 'Payment status cannot be updated.'], 422);
    }

    /**
     * Payment Cancelled Callback.
     *
     * POST /cancel
     */
    public function cancel(Request $request)
    {
        $tran_id = $request->input('tran_id');

        if (!$tran_id) {
            return response()->json(['success' => false, 'message' => 'Transaction ID missing.'], 400);
        }

        $payment = Payment::where('gateway_transaction_id', $tran_id)
            ->orWhere('transaction_no', $tran_id)
            ->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment record not found.'], 404);
        }

        if ($payment->status === 'Pending') {
            $payment->update([
                'status' => 'Cancelled',
                'gateway_response' => $request->all(),
            ]);
            return response()->json(['success' => false, 'message' => 'Payment cancelled.']);
        }

        return response()->json(['success' => false, 'message' => 'Payment cannot be cancelled.'], 422);
    }

    /**
     * IPN (Instant Payment Notification) Handler.
     *
     * POST /ipn
     */
    public function ipn(Request $request)
    {
        $tran_id = $request->input('tran_id');

        if (!$tran_id) {
            return response()->json(['success' => false, 'message' => 'Transaction ID missing.'], 400);
        }

        $payment = Payment::where('gateway_transaction_id', $tran_id)
            ->orWhere('transaction_no', $tran_id)
            ->first();

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Payment record not found.'], 404);
        }

        if ($payment->status === 'Pending') {
            $sslc = new SslCommerzNotification();
            $validation = $sslc->orderValidate(
                $request->all(),
                $tran_id,
                $payment->total_amount,
                $payment->currency
            );

            if ($validation == TRUE) {
                $this->markPaymentAsPaid($payment, $request->all());
                return response()->json(['success' => true, 'message' => 'Payment completed via IPN.']);
            }
        } elseif (in_array($payment->status, ['Completed', 'Paid'])) {
            return response()->json(['success' => true, 'message' => 'Payment already completed.']);
        }

        return response()->json(['success' => false, 'message' => 'Invalid payment status.'], 422);
    }
    /**
     * Get Payment Details for an Appointment.
     *
     * GET /appointments/{appointmentId}/payment-details
     */
    public function paymentDetails($appointmentId)
    {
        $appointment = Appointment::with(['patient', 'patient.user', 'doctor', 'payment'])
            ->where('appointment_no', $appointmentId)
            ->first();

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'appointment' => $appointment,
            'payment' => $appointment->payment,
        ]);
    }

    /**
     * Generate a unique transaction number.
     */
    private function generateTransactionNo(): string
    {
        return 'TXN-' . strtoupper(Str::random(12));
    }

    /**
     * Prepare data for SSLCommerz payment gateway.
     */
    private function prepareSslCommerzData(Appointment $appointment, Payment $payment): array
    {
        $patient = $appointment->patient;
        $doctor = $appointment->doctor;

        return [
            'total_amount' => $payment->total_amount,
            'currency' => $payment->currency,
            'tran_id' => $payment->transaction_no,
            'gateway_transaction_id' => $payment->transaction_no,

            // Customer Information
            'cus_name' => $patient?->name ?? 'Customer',
            'cus_email' => $patient?->user?->email ?? $patient?->email ?? 'customer@mail.com',
            'cus_add1' => $patient?->address_line1 ?? 'Address',
            'cus_add2' => $patient?->address_line2 ?? '',
            'cus_city' => $patient?->city ?? '',
            'cus_state' => $patient?->state ?? '',
            'cus_postcode' => $patient?->postal_code ?? '',
            'cus_country' => $patient?->country ?? 'Bangladesh',
            'cus_phone' => $patient?->phone ?? '8801XXXXXXXXX',
            'cus_fax' => '',

            // Shipment Information
            'ship_name' => $doctor?->name ?? 'Doctor',
            'ship_add1' => $doctor?->chamber_address ?? 'Address',
            'ship_add2' => '',
            'ship_city' => $doctor?->city ?? '',
            'ship_state' => $doctor?->state ?? '',
            'ship_postcode' => '',
            'ship_phone' => '',
            'ship_country' => $doctor?->country ?? 'Bangladesh',

            // Product Information
            'shipping_method' => 'NO',
            'product_name' => 'Consultation Fee',
            'product_category' => 'Healthcare',
            'product_profile' => 'healthcare-services',

            // Optional Parameters
            'value_a' => $appointment->appointment_no,
            'value_b' => (string) $payment->id,
            'value_c' => $patient?->id ?? '',
            'value_d' => $doctor?->id ?? '',
        ];
    }

    /**
     * Mark payment as paid and update appointment status.
     */
    private function markPaymentAsPaid(Payment $payment, array $gatewayResponse = []): void
    {
        $payment->update([
            'status' => 'Completed',
            'paid_amount' => $payment->total_amount,
            'due_amount' => 0,
            'paid_at' => now(),
            'gateway_transaction_id' => $gatewayResponse['tran_id'] ?? $gatewayResponse['bank_txn_id'] ?? $payment->transaction_no,
            'gateway_response' => $gatewayResponse,
        ]);

        // Update appointment payment status
        $appointment = $payment->appointment;
        if ($appointment) {
            $appointment->update([
                'payment_status' => 'paid',
            ]);
        }
    }
}
