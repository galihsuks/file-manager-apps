<?php

namespace App\Models;

use CodeIgniter\Model;

class BaseModel extends Model
{
    public $LIMIT_DATA = 20;
    public function generateID(string $prefix): string
    {
        $timestamp = round(microtime(true) * 1000);
        return $prefix . $timestamp;
    }
}
