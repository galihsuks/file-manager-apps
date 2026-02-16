<?php

namespace App\Models;

use CodeIgniter\Model;

class LogModel extends BaseModel
{
    protected $table = 'logs';
    protected $primaryKey = 'id';
    protected $allowedFields = [
        'level', 
        'message',
        'context', 
        'ip_address',
    ];
    protected $useTimestamps = true; 

    public function info($message, $context = [], $ip_address = null)
    {
        $params = [
            'level' => 'info',
            'message' => $message,
            'context' => json_encode($context),
            'ip_address' => $ip_address
        ];
        $this->insert($params);
    }
    public function warning($message, $context = [], $ip_address = null)
    {
        $params = [
            'level' => 'warning',
            'message' => $message,
            'context' => json_encode($context),
            'ip_address' => $ip_address
        ];
        $this->insert($params);
    }
    public function error($message, $context = [], $ip_address = null)
    {
        $params = [
            'level' => 'error',
            'message' => $message,
            'context' => json_encode($context),
            'ip_address' => $ip_address
        ];
        $this->insert($params);
    }
    public function getLogAll($pag = '1', $level = '', $q = '', $ip = '', $startDate = '', $endDate = '') {
        $offset = ($pag - 1) * $this->LIMIT_DATA;
        $builder = $this->orderBy('id', 'DESC');
        if ($level) {
            $builder->where('level', $level);
        }
        if ($ip) {
            $builder->where('ip_address', $ip);
        }
        if ($startDate) {
            $builder->where('created_at >=', $startDate);
        }
        if ($endDate) {
            $builder->where('created_at <=', $endDate);
        }
        if ($q) {
            $builder->like('message', $q);
            $builder->orLike('context', $q);
        }
        return [
            'count' => $builder->countAllResults(false),
            'data' => $builder->findAll($this->LIMIT_DATA, $offset)
        ];
    }
}
