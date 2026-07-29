<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $identifier = trim((string) ($data['identifier'] ?? $data['email'] ?? $data['phone'] ?? ''));
        $role = $request->route('role') ?? ($data['role'] ?? null);

        $user = User::query()
            ->with(['roles', 'permissions'])
            ->where(function ($query) use ($identifier): void {
                $query->where('email', $identifier)
                    ->orWhere('phone', $identifier)
                    ->orWhere('username', $identifier);
            })
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Invalid login credentials.'],
            ]);
        }

        if ($role && ! $user->hasRole($role)) {
            throw ValidationException::withMessages([
                'role' => ["This account is not assigned to the {$role} portal."],
            ]);
        }

        if (! $user->hasAnyRole(['admin', 'super-admin']) && $user->status !== 'active') {
            throw ValidationException::withMessages([
                'identifier' => ['Your account is not active yet.'],
            ]);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $abilities = $user->getRoleNames()->isNotEmpty()
            ? $user->getRoleNames()->values()->all()
            : ['user'];

        $token = $user->createToken('healthcare-api', $abilities)->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user->fresh(['roles', 'permissions'])),
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = $request->route('role') ?? ($data['role'] ?? 'patient');

        if ($role === 'admin') {
            throw ValidationException::withMessages([
                'role' => ['Admin accounts are provisioned manually.'],
            ]);
        }

        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'status' => $role === 'doctor' ? 'pending_verification' : 'active',
        ]);

        $user->assignRole($role);
        $user->refresh()->load(['roles', 'permissions']);

        $token = $user->createToken('healthcare-api', [$role])->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => new UserResource($user->loadMissing(['roles', 'permissions'])),
        ]);
    }
}
