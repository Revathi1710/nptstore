<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectsTable extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('company')->nullable();
            $table->string('project')->nullable();
            $table->string('project_type')->nullable();
            $table->string('ownership')->nullable();
            $table->string('industry')->nullable();
            $table->decimal('project_cost', 15, 2)->nullable();
            $table->text('products_capacity')->nullable();
            $table->string('completion_schedule')->nullable();
            $table->string('project_stage')->nullable();
            $table->string('location')->nullable();
            $table->string('district')->nullable();
            $table->string('project_state')->nullable();
            $table->text('project_history')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('pincode')->nullable();
            $table->string('addr_state')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('person_name_1')->nullable();
            $table->string('person_name_2')->nullable();
            $table->date('added_date')->nullable();
            $table->timestamps();
        });

        Schema::create('pdf_files', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->longText('pdf_base64'); // store PDF as base64
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
        Schema::dropIfExists('pdf_files');
    }
}