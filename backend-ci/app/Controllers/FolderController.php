<?php

namespace App\Controllers;

use App\Controllers\BaseController;

class FolderController extends BaseController
{
    // ===================================
    // GET FOLDERS
    // ===================================
    public function getFolders()
    {
        try {
            $parentId = $this->request->getGet('parent_id');

            $builder = $this->folderModel
                ->orderBy('name', 'ASC');

            if (!$parentId) {
                $builder->where('parent_id IS NULL');
            } else {
                $builder->where('parent_id', $parentId);
            }

            $result = $builder->findAll();

            return $this->response->setJSON($result)->setStatusCode(200);

        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    // ===================================
    // CREATE FOLDER (ADMIN ONLY)
    // ===================================
    public function createFolder()
    {
        try {
            if (!$this->isAdmin()) {
                return $this->response->setJSON([
                    'message' => 'Admin only'
                ])->setStatusCode(403);
            }

            $request = $this->request->getJSON(true);

            $name     = $request['name'] ?? null;
            $parentId = $request['parent_id'] ?? null;
            $parentId = ($parentId === "null") ? null : $parentId;

            if (!$name) {
                return $this->response->setJSON([
                    'message' => 'Folder name required'
                ])->setStatusCode(400);
            }

            $idGenerated = $this->generateID('FOLDER');

            $this->folderModel->insert([
                'id'        => $idGenerated,
                'name'      => $name,
                'parent_id' => $parentId
            ]);

            return $this->response->setJSON([
                'message'   => 'Folder created',
                'id'        => $idGenerated,
                'name'      => $name,
                'parent_id' => $parentId
            ])->setStatusCode(200);

        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    // ===================================
    // DELETE FOLDER (ADMIN ONLY)
    // ===================================
    public function deleteFolder($id = null)
    {
        try {
            if (!$this->isAdmin()) {
                return $this->response->setJSON([
                    'message' => 'Admin only'
                ])->setStatusCode(403);
            }

            if (!$id) {
                return $this->response->setJSON([
                    'message' => 'Folder ID required'
                ])->setStatusCode(400);
            }

            $this->deleteFolderRecursive($id);

            return $this->response->setJSON([
                'message' => 'Folder deleted successfully'
            ])->setStatusCode(200);

        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => 'Failed to delete folder'
            ])->setStatusCode(500);
        }
    }

    // ===================================
    // RECURSIVE DELETE
    // ===================================
    private function deleteFolderRecursive($id)
    {
        // 1️⃣ Ambil semua file di folder ini
        $files = $this->fileModel
            ->where('parent_id', $id)
            ->findAll();

        foreach ($files as $file) {
            $filePath = $this->uploadPath . $file['id'] . '.' . $file['ext'];

            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        // 2️⃣ Hapus file dari DB
        $this->fileModel->where('parent_id', $id)->delete();

        // 3️⃣ Ambil semua subfolder
        $subfolders = $this->folderModel
            ->where('parent_id', $id)
            ->findAll();

        foreach ($subfolders as $sub) {
            $this->deleteFolderRecursive($sub['id']);
        }

        // 4️⃣ Hapus folder ini
        $this->folderModel->where('id', $id)->delete();
    }
}
