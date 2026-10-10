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
        Schema::table('teams', function (Blueprint $table) {
            $table->boolean('lead_form_show_booking_link')->default(false)->after('lead_form_social_links');
            $table->foreignId('lead_form_booking_link_id')
                ->nullable()
                ->after('lead_form_show_booking_link')
                ->constrained('booking_links')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lead_form_booking_link_id');
            $table->dropColumn('lead_form_show_booking_link');
        });
    }
};
