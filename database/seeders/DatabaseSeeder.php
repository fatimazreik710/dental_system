<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'dr.farah@example.com'], // Or any email you prefer
            [
                'name' => 'Dr. Farah',
                'password' => 'password123', // Let the model cast hash it
            ]
        );
    }
}
