<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\FileModel;
use App\Models\FolderModel;
use CodeIgniter\Controller;
use CodeIgniter\HTTP\CLIRequest;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Log\LoggerInterface;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 */

abstract class BaseController extends Controller
{
    /**
     * @var UserModel
    */
    protected $userModel;
    
    /**
     * @var FileModel
    */
    protected $fileModel;
    
    /**
     * @var FolderModel
    */
    protected $folderModel;
    protected $UUID;
    protected $UserID;
    protected $uploadPath = WRITEPATH . 'uploads/';
    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->fileModel = new FileModel();
        $this->folderModel = new FolderModel();
        $this->UUID = '';
        $this->UserID = '';
        
        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0777, true);
        }
    }

    /**
     * Instance of the main Request object.
     *
     * @var CLIRequest|IncomingRequest
     */
    protected $request;

    /**
     * An array of helpers to be loaded automatically upon
     * class instantiation. These helpers will be available
     * to all other controllers that extend BaseController.
     *
     * @var list<string>
     */
    protected $helpers = [];

    /**
     * Be sure to declare properties for any property fetch you initialized.
     * The creation of dynamic property is deprecated in PHP 8.2.
     */
    // protected $session;

    /**
     * @return void
     */
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);

        // Preload any models, libraries, etc, here.

        // E.g.: $this->session = service('session');
    }

    public function generateID(string $prefix): string
    {
        $timestamp = round(microtime(true) * 1000);
        return $prefix . $timestamp;
    }

    public function isAdmin(): bool
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        if (!$authHeader) {
            return false;
        }

        try {
            $token = explode(' ', $authHeader)[1] ?? null;

            if (!$token) {
                return false;
            }

            $secret = getenv('JWT_SECRET');

            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            return isset($decoded->role) && $decoded->role === 'admin';

        } catch (\Exception $e) {
            return false;
        }
    }
}
