<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('status_temp')->default(true)->after('status');
            $table->string('role_temp')->default('viewer')->after('role');
        });

        // Migrate data
        DB::table('users')->whereIn('status', ['ready', 'processing'])->update(['status_temp' => true]);
        DB::table('users')->where('status', 'failed')->update(['status_temp' => false]);

        DB::table('users')->where('role', 'Admin')->update(['role_temp' => 'admin']);
        DB::table('users')->whereIn('role', ['Viewer', 'Analyst'])->update(['role_temp' => 'viewer']);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'role']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('status_temp', 'status');
            $table->renameColumn('role_temp', 'role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status_temp')->default('ready')->after('status');
            $table->string('role_temp')->default('Viewer')->after('role');
        });

        DB::table('users')->where('status', true)->update(['status_temp' => 'ready']);
        DB::table('users')->where('status', false)->update(['status_temp' => 'failed']);

        DB::table('users')->where('role', 'admin')->update(['role_temp' => 'Admin']);
        DB::table('users')->where('role', 'viewer')->update(['role_temp' => 'Viewer']);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'role']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('status_temp', 'status');
            $table->renameColumn('role_temp', 'role');
        });
    }
};
