<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class Cors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $origin = $request->getHeaderLine('Origin');
        $allowedEnv = env('ALLOWED_ORIGINS');
        $allowedOrigins = $allowedEnv ? array_map('trim', explode(',', $allowedEnv)) : [];

        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-Signature, X-Timestamp, x-device-id, Authorization");
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
            header("Access-Control-Allow-Credentials: true");
        }

        // ✅ handle preflight (OPTIONS)
        if ($request->getMethod() === 'options') {
            http_response_code(200);
            exit; // stop here, no need to go deeper
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return $response;
    }
}
