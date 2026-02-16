<?php

namespace App\Models;

class FileModel extends BaseModel
{
    protected $table            = 'files';
    protected $primaryKey       = 'id';
    protected $allowedFields    = [
        'id',
        'filename', 
        'owner',
        'ext',
        'parent_id',
    ];
    protected $returnType       = 'array';
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = 'updated_at';
}
