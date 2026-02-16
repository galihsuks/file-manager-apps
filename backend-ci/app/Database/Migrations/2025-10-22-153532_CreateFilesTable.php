<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFilesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'VARCHAR',
                'constraint'     => 20,
            ],
            'filename' => [
                'type'           => 'VARCHAR',
                'constraint'     => 100,
            ],
            'owner' => [
                'type'           => 'VARCHAR',
                'constraint'     => 20,
            ],
            'ext' => [
                'type'           => 'VARCHAR',
                'constraint'     => 7,
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
        $this->forge->createTable('files');
    }

    public function down()
    {
        $this->forge->dropTable('files');
    }
}
