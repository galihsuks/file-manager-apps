<?php

namespace App\Models;

class FolderModel extends BaseModel
{
    protected $table            = 'folders';
    protected $primaryKey       = 'id';
    protected $allowedFields    = [
        'id',
        'name', 
        'parent_id',
    ];
    protected $returnType       = 'array';
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = 'updated_at';
}
