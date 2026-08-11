<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'last_login_at' => $this->last_login_at?->toISOString(),
            'two_factor_enabled' => (bool) $this->two_factor_enabled,
            'patient' => $this->whenLoaded('patient', function (): array {
                return [
                    'id' => (string) $this->patient->id,
                    'name' => $this->patient->name,
                    'email' => $this->patient->email,
                    'phone' => $this->patient->phone,
                    'mrn' => $this->patient->mrn,
                    'gender' => $this->patient->gender,
                    'bloodGroup' => $this->patient->blood_group,
                    'dateOfBirth' => $this->patient->date_of_birth?->toDateString(),
                    'city' => $this->patient->city,
                    'state' => $this->patient->state,
                    'country' => $this->patient->country,
                    'status' => $this->patient->status,
                    'hospital' => $this->patient->hospital ? [
                        'id' => (string) $this->patient->hospital->id,
                        'name' => $this->patient->hospital->name,
                        'city' => $this->patient->hospital->city,
                    ] : null,
                ];
            }),
            'roles' => $this->getRoleNames()->values(),
            'permissions' => $this->getAllPermissions()->pluck('name')->values(),
            'token_abilities' => $request->user()?->currentAccessToken()?->abilities ?? [],
        ];
    }
}
