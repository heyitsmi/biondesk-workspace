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
            $table->string('lead_form_meta_title')->nullable()->after('lead_form_social_links');
            $table->string('lead_form_meta_description', 300)->nullable()->after('lead_form_meta_title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn(['lead_form_meta_title', 'lead_form_meta_description']);
        });
    }
};
