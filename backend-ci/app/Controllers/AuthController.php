<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController extends BaseController
{
    // =========================
    // LOGIN
    // =========================
    public function login()
    {
        $request = $this->request->getJSON(true);

        $username = $request['username'] ?? null;
        $password = $request['password'] ?? null;

        $user = $this->userModel
            ->where('username', $username)
            ->first();

        if (!$user) {
            return $this->response->setJSON([
                'message' => 'Invalid credentials'
            ])->setStatusCode(401);
        }

        if (!password_verify($password, $user['password'])) {
            return $this->response->setJSON([
                'message' => 'Invalid credentials'
            ])->setStatusCode(401);
        }

        $secret = getenv('JWT_SECRET');

        $payload = [
            'id'   => $user['id'],
            'role' => $user['role'],
            'iat'  => time(),
            'exp'  => time() + (60 * 60 * 24) // 1 hari
        ];

        $token = JWT::encode($payload, $secret, 'HS256');

        return $this->response->setJSON([
            'token' => $token,
            'id'    => $user['id']
        ])->setStatusCode(200);
    }

    // =========================
    // SIGNUP
    // =========================
    public function signup()
    {
        $request = $this->request->getJSON(true);

        $username  = $request['username'] ?? null;
        $password  = $request['password'] ?? null;
        $role      = $request['role'] ?? 'user';
        $pass_role = $request['pass_role'] ?? null;

        if ($role === 'admin' && $pass_role !== '123456') {
            return $this->response->setJSON([
                'message' => 'Forbidden'
            ])->setStatusCode(403);
        }

        // cek existing user (case insensitive)
        $existing = $this->userModel
            ->where('username', $username)
            ->first();

        if ($existing) {
            return $this->response->setJSON([
                'message'  => "Success get {$role}",
                'id'       => $existing['id'],
                'username' => $existing['username'],
                'role'     => $existing['role'],
            ])->setStatusCode(200);
        }

        // hash password
        $hash = password_hash($password, PASSWORD_DEFAULT);

        // generate ID sederhana (contoh U + uniqid)
        $idGenerated = $this->generateID("U");

        $this->userModel->insert([
            'id'       => $idGenerated,
            'username' => $username,
            'password' => $hash,
            'role'     => $role
        ]);

        return $this->response->setJSON([
            'message'  => "Success add {$role}",
            'id'       => $idGenerated,
            'username' => $username,
            'role'     => $role
        ])->setStatusCode(200);
    }

    // =========================
    // SEARCH USER
    // =========================
    public function search()
    {
        $request = $this->request->getJSON(true);
        $username = $request['username'] ?? null;

        $user = $this->userModel
            ->where('username', $username)
            ->first();

        if (!$user) {
            return $this->response->setJSON(null);
        }

        return $this->response->setJSON($user);
    }
}
