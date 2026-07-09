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
            $table->boolean('lead_form_enabled')->default(true);
            $table->string('lead_form_title')->nullable();
            $table->text('lead_form_description')->nullable();
            $table->text('lead_form_welcome_message')->nullable();
            $table->string('lead_form_background_theme')->default('dark');
            $table->json('lead_form_services')->nullable();
            $table->boolean('lead_form_ask_budget')->default(true);
            $table->boolean('lead_form_allow_attachments')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn([
                'lead_form_enabled',
                'lead_form_title',
                'lead_form_description',
                'lead_form_welcome_message',
                'lead_form_background_theme',
                'lead_form_services',
                'lead_form_ask_budget',
                'lead_form_allow_attachments',
            ]);
        });
    }
};
