<?php
 
namespace App\Enums;
 
enum UserRole: string
{
    case ADMIN = 'admin';
    case VIEWER = 'viewer';

    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Admin',
            self::VIEWER => 'Viewer',
        };
    }
}
