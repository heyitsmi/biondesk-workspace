<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations. Backfills public_token for any document created
     * before the auto-assign-on-create behavior existed (Fase 6).
     */
    public function up(): void
    {
        DB::table('documents')
            ->whereNull('public_token')
            ->orderBy('id')
            ->chunkById(100, function ($documents): void {
                foreach ($documents as $document) {
                    DB::table('documents')
                        ->where('id', $document->id)
                        ->update(['public_token' => Str::random(32)]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
