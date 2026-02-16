<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->group('api', function($routes) {
    $routes->options('(:any)', static function () {});
    
    $routes->get('files/view/(:any)', 'FileController::viewFile/$1');
    $routes->get('files/download/(:any)', 'FileController::downloadFile/$1');
    $routes->get('files', 'FileController::getFiles');
    $routes->delete('files/(:any)', 'FileController::deleteFile/$1');
    $routes->post('upload', 'FileController::uploadFile');

    
    $routes->post('login', 'AuthController::login');
    $routes->post('signup', 'AuthController::signup');
    $routes->post('user/search', 'AuthController::search');

    $routes->get('folders', 'FolderController::getFolders');
    $routes->post('folders', 'FolderController::createFolder');
    $routes->delete('folders/(:any)', 'FolderController::deleteFolder/$1');
});