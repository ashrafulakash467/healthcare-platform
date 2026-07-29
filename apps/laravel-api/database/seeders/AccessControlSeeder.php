<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;

class AccessControlSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
            Permission::findOrCreate($permission, 'web');
        }

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
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($rolePermissions);
        }
    }
}
