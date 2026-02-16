<?php

namespace App\Models;

class UserModel extends BaseModel
{
    protected $table            = 'users';
    protected $primaryKey       = 'id';
    protected $allowedFields    = [
        'id',
        'username', 
        'password',
        'role',
    ];
    protected $returnType       = 'array';
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = 'updated_at';

    public function insertUser($params) {
        $params['id'] = $this->generateIdItem();
        $this->insert($params);
        return $this->getUserByUsername($params['username']);
    }
    public function getUserByUsername($username) {
        return $this->where('username', $username)->first();
    }
    public function getUserById($id) {
        return $this->where('id', $id)->first();
    }
    public function getUserByEmailOrUsername($email, $username) {
        return $this->where('email', $email)->orWhere('username', $username)->first();
    }
    public function updateUserById($id, $params) {
        $updated = $this->update($id, $params);
        if ($updated) {
            return $this->getUserById($id);
        }
        return null;
    }
    public function destroyUserById($id) {
        $data = $this->getUserById($id);
        if ($data) {
            $this->delete($id);
            return $data;
        }
        return null;
    }
}
