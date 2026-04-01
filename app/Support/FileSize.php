<?php

namespace App\Support;

final class FileSize
{
    /**
     * Convert bytes to a human readable string.
     */
    public static function human(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = (int) floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $value = $bytes / (1024 ** $pow);

        return round($value, $precision).' '.$units[$pow];
    }
}

