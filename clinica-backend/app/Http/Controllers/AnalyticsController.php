<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function summary()
    {
        // Return summary analytics (stub)
        return [
            'patients' => 0,
            'appointments' => 0,
            'revenue' => 0,
        ];
    }

    public function patients()
    {
        // Return patient analytics (stub)
        return [];
    }

    public function visits()
    {
        // Return visit analytics (stub)
        return [];
    }

    public function doctors()
    {
        // Return doctor analytics (stub)
        return [];
    }

    public function revenue()
    {
        // Return revenue analytics (stub)
        return [];
    }
}
