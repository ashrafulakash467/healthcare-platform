<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Illuminate\Database\Seeder;

class AccessControlSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guardName = config('auth.defaults.guard', 'web');
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'access-admin-panel',
            'access-doctor-panel',
            'access-patient-panel',
            'access-hospital-panel',
            'manage-users',
            'manage-doctors',
            'manage-hospitals',
            'manage-appointments',
            'manage-payments',
            'manage-content',
            'manage-reports',
            'manage-notifications',
            'manage-support',
            'manage-roles',
            'manage-settings',
            'view-audit-logs',
            'view-earnings',
            'manage-schedule',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => $guardName,
            ]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $roles = [
            'super-admin' => $permissions,
            'admin' => $permissions,
            'doctor' => [
                'access-doctor-panel',
                'manage-appointments',
                'manage-schedule',
                'view-earnings',
            ],
            'patient' => [
                'access-patient-panel',
                'manage-appointments',
            ],
            'hospital' => [
                'access-hospital-panel',
                'manage-doctors',
                'manage-appointments',
                'manage-payments',
                'manage-reports',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => $guardName,
            ]);
            $role->syncPermissions($rolePermissions);
        }
    }
}
