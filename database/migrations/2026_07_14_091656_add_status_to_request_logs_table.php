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
        Schema::table('request_logs', function (Blueprint $table) {
            $table->string('status')->default('submitted')->after('classification');
            $table->index(['project_id', 'visible_to_client', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('request_logs', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'visible_to_client', 'status']);
            $table->dropColumn('status');
        });
    }
};
