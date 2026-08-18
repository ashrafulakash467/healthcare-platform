<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'name')) {
                $table->string('name', 50)->nullable()->unique()->after('name');
            }
        });

        $this->dropUniqueIndexesOnColumn('users', 'role');

        DB::table('users')
            ->select(['id', 'name','email'])
            ->orderBy('id')
            ->get()
            ->each(function ($user): void {
                if (filled($user->name)) {
                    // Keep existing name when present.
                    return;
                }

                $seed = Str::slug((string) ($user->name ?: $user->email ?: ('user-' . $user->id)));
                $seed = Str::lower(trim($seed));

                if ($seed === '') {
                    $seed = 'user-' . $user->id;
                }

                $candidate = Str::limit($seed, 50, '');
                $suffix = 1;

                while (DB::table('users')->where('name', $candidate)->where('id', '!=', $user->id)->exists()) {
                    $candidate = Str::limit($seed, 50 - (strlen((string) $suffix) + 1), '') . '-' . $suffix;
                    $suffix++;
                }

                DB::table('users')->where('id', $user->id)->update([
                    'name' => $candidate,
                ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('users') || ! Schema::hasColumn('users', 'name')) {
            return;
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique('users_name_unique');
            $table->dropColumn('name');
        });
    }

    private function dropUniqueIndexesOnColumn(string $tableName, string $columnName): void
    {
        $indexes = collect(DB::select("SHOW INDEX FROM `{$tableName}` WHERE Non_unique = 0"))
            ->filter(fn ($index) => $index->Key_name !== 'PRIMARY' && $index->Column_name === $columnName)
            ->pluck('Key_name')
            ->unique()
            ->values()
            ->all();

        if ($indexes === []) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($indexes): void {
            foreach ($indexes as $index) {
                $table->dropUnique($index);
            }
        });
    }
};
