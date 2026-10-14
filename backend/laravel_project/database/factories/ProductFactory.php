<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name'           => $this->faker->words(3, true),
            'slug'           =>$this->faker->words(3, true),
            'code'           => strtoupper($this->faker->unique()->bothify('PRD-####')),
            'published_in'   => $this->faker->year(),
            'format'         => $this->faker->randomElement(['Digital', 'Physical', 'Hybrid']),
            'total_projects' => $this->faker->numberBetween(1, 100),
            'description'    => $this->faker->paragraphs(2, true),
            'highlights'     => "• " . implode("\n• ", $this->faker->sentences(4)),
            'status'         => $this->faker->randomElement(['active', 'inactive']),
            'price'          => $this->faker->randomFloat(2, 10, 9999),
            'quantity'       => $this->faker->numberBetween(0, 500),
        ];
    }

    /** Set status to active. */
    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }

    /** Set status to inactive. */
    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }
}