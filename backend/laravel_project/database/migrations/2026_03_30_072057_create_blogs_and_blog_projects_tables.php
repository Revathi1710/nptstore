<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->nullable();          // news, state, industry, region, ...
            $table->string('blog_type')->nullable();         // top_projects, tracker, analysis, general
            $table->enum('status', ['published', 'draft', 'inactive'])->default('published');
            $table->text('short_description')->nullable();
            $table->longText('content')->nullable();
            $table->string('featured_image')->nullable();    // storage path
            $table->string('author')->nullable();
            $table->date('published_at')->nullable();
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->timestamps();
        });

        Schema::create('blog_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_id')->constrained()->cascadeOnDelete();
            $table->string('promoter')->nullable();
            $table->string('products_capacity')->nullable();
            $table->string('location')->nullable();
            $table->string('investment')->nullable();
            $table->string('completion')->nullable();
            $table->text('summary')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_projects');
        Schema::dropIfExists('blogs');
    }
};