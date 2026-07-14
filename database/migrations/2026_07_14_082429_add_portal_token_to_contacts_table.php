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
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('portal_token', 40)->nullable()->unique()->after('id');
        });

        DB::table('contacts')
            ->whereNull('portal_token')
            ->orderBy('id')
            ->lazyById()
            ->each(function (object $contact): void {
                do {
                    $token = Str::random(32);
                } while (DB::table('contacts')->where('portal_token', $token)->exists());

                DB::table('contacts')
                    ->where('id', $contact->id)
                    ->update(['portal_token' => $token]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn('portal_token');
        });
    }
};
