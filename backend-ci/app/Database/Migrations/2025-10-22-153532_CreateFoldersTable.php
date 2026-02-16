<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFoldersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'VARCHAR',
                'constraint'     => 20,
            ],
            'name' => [
                'type'           => 'VARCHAR',
                'constraint'     => 100,
            ],
            'parent_id' => [
                'type'           => 'VARCHAR',
                'constraint'     => 20,
                'null'           => true,
            ],
            'created_at' => [
                'type'           => 'DATETIME',
                'null'           => true,
            ],
            'updated_at' => [
                'type'           => 'DATETIME',
                'null'           => true,
            ],
        ]);
        $this->forge->addKey('id', true); // Primary key
        $this->forge->createTable('folders');
    }

    public function down()
    {
        $this->forge->dropTable('folders');
    }
}
