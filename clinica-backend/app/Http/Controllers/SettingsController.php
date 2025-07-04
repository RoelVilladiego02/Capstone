<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        return Setting::all();
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string',
            'value' => 'required|string',
        ]);
        $setting = Setting::updateOrCreate(['key' => $validated['key']], ['value' => $validated['value']]);
        return $setting;
    }
}
