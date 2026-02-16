<?php

namespace App\Controllers;

use App\Controllers\BaseController;

class FileController extends BaseController
{
    // ===================================
    // UPLOAD FILE
    // ===================================
    public function uploadFile()
    {
        try {
            $deviceId = $this->request->getHeaderLine('x-device-id');

            // 1️⃣ Validasi device ID
            $user = $this->userModel
                ->where('id', $deviceId)
                ->first();

            if (!$user) {
                return $this->response->setJSON([
                    'message' => 'Device ID is not valid'
                ])->setStatusCode(402);
            }

            // 2️⃣ Ambil file
            $file = $this->request->getFile('file');

            if (!$file || !$file->isValid()) {
                return $this->response->setJSON([
                    'message' => 'Invalid file'
                ])->setStatusCode(400);
            }

            $originalName = $file->getClientName();
            $ext          = $file->getClientExtension();
            $parentId     = $this->request->getPost('parent_id');
            $parentId     = ($parentId === "null") ? null : $parentId;

            // 3️⃣ Cek duplicate
            $duplicate = $this->fileModel
                ->where('filename', $originalName)
                ->where($parentId ? 'parent_id =' : 'parent_id IS NULL', $parentId)
                ->first();

            if ($duplicate) {
                return $this->response->setJSON([
                    'message' => 'Gagal upload, filename sudah ada di folder ini'
                ])->setStatusCode(400);
            }

            // 4️⃣ Generate ID
            $fileId = $this->generateID('FILE');

            // 5️⃣ Simpan file fisik
            $file->move($this->uploadPath, $fileId . '.' . $ext);

            // 6️⃣ Insert database
            $this->fileModel->insert([
                'id'        => $fileId,
                'filename'  => $originalName,
                'owner'     => $deviceId,
                'ext'       => $ext,
                'parent_id' => $parentId
            ]);

            return $this->response->setJSON([
                'message'   => 'File uploaded',
                'id'        => $fileId,
                'filename'  => $originalName,
                'owner'     => $deviceId,
                'ext'       => $ext,
                'parent_id' => $parentId
            ])->setStatusCode(200);

        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    // ===================================
    // LIST FILE
    // ===================================
    public function getFiles()
    {
        try {
            $parentId = $this->request->getGet('parent_id');

            $builder = $this->fileModel
                ->select('files.*, users.username')
                ->join('users', 'users.id = files.owner', 'left')
                ->orderBy('filename', 'ASC');

            if ($parentId) {
                $builder->where('files.parent_id', $parentId);
            } else {
                $builder->where('files.parent_id IS NULL');
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
    // DELETE FILE
    // ===================================
    public function deleteFile($id = null)
    {
        try {
            $deviceId = $this->request->getHeaderLine('x-device-id');

            $file = $this->fileModel
                ->where('id', $id)
                ->first();

            if (!$file) {
                return $this->response->setJSON([
                    'message' => 'Not found'
                ])->setStatusCode(404);
            }

            // 🔐 cek permission (owner only)
            if (!$this->isAdmin() && $file['owner'] !== $deviceId) {
                return $this->response->setJSON([
                    'message' => 'Forbidden'
                ])->setStatusCode(403);
            }

            $filePath = $this->uploadPath . $file['id'] . '.' . $file['ext'];

            // hapus file fisik
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // hapus database
            $this->fileModel->where('id', $id)->delete();

            return $this->response->setJSON([
                'message' => 'Deleted success',
                'file'    => $file['id'] . '.' . $file['ext']
            ])->setStatusCode(200);

        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    public function downloadFile($filename)
    {
        $filePath = $this->uploadPath . $filename;
        if (!file_exists($filePath)) {
            return $this->response->setStatusCode(404);
        }
        return $this->response->download($filePath, null);
    }

    public function viewFile($filename = null)
    {
        try {
            if (!$filename) {
                return $this->response->setStatusCode(400);
            }

            $filePath = $this->uploadPath . $filename;

            if (!file_exists($filePath)) {
                return $this->response->setStatusCode(404);
            }

            $mime = mime_content_type($filePath);

            return $this->response
                ->setHeader('Content-Type', $mime)
                ->setHeader('Content-Disposition', 'inline; filename="' . $filename . '"')
                ->setBody(file_get_contents($filePath));

        } catch (\Exception $e) {
            return $this->response->setStatusCode(500);
        }
    }
}
