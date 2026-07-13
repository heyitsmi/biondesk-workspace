<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('recurring_invoice_template_id')->nullable()->after('opportunity_id')
                ->constrained()->nullOnDelete();
            $table->unique(['recurring_invoice_template_id', 'issued_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropUnique(['recurring_invoice_template_id', 'issued_at']);
            $table->dropConstrainedForeignId('recurring_invoice_template_id');
        });
    }
};
