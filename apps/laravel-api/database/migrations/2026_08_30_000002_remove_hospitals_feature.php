<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('hospital_doctors');

        $columns = [
            'patients' => 'hospital_id',
            'doctors' => 'primary_hospital_id',
            'doctor_schedules' => 'hospital_id',
            'appointment_slots' => 'hospital_id',
            'appointments' => 'hospital_id',
            'payments' => 'hospital_id',
            'support_tickets' => 'hospital_id',
        ];

        foreach ($columns as $tableName => $column) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, $column)) {
                Schema::table($tableName, function (Blueprint $table) use ($column): void {
                    $table->dropConstrainedForeignId($column);
                });
            }
        }

        Schema::dropIfExists('hospitals');
    }

    public function down(): void
    {
        // Hospital data cannot be reconstructed after this domain removal.
    }
};
