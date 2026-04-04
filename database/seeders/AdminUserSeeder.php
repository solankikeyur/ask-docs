<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
        ['email' => 'admin@admin.com'],
        [
            'name' => 'Admin User',
            'password' => Hash::make('password'), // You should change this after the first login
            'role' => UserRole::ADMIN,
            'status' => true,
        ]
        );
    }
}
