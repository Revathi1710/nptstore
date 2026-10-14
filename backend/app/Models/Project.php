<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'company',
        'project',
        'project_type',
        'ownership',
        'industry',
        'project_cost',
        'products_capacity',
        'completion_schedule',
        'project_stage',
        'location',
        'district',
        'project_state',
        'project_history',
        'address',
        'city',
        'pincode',
        'addr_state',
        'telephone',
        'email',
        'person_name_1',
        'person_name_2',
        'added_date',
    ];

    protected $casts = [
        'added_date' => 'date',
    ];
}
