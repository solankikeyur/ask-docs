<?php

namespace App\Http\FortifyResponses;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;

class RedirectAfterAuthentication
{
    public static function to(Request $request, ?string $suffix = null): string
    {
        /** @var User|null $user */
        $user = $request->user();

        $fallback = $user?->role === UserRole::ADMIN
            ? route('dashboard')
            : route('chat.index');

        $intended = $request->session()->pull('url.intended');
        if (! is_string($intended) || $intended === '') {
            return static::withSuffix($fallback, $suffix);
        }

        $intendedPath = parse_url($intended, PHP_URL_PATH) ?? '';
        $isAdminPath = is_string($intendedPath) && str_starts_with($intendedPath, '/admin');
        $isAdminUser = $user?->role === UserRole::ADMIN;

        if ($isAdminPath && ! $isAdminUser) {
            return static::withSuffix($fallback, $suffix);
        }

        return static::withSuffix($intended, $suffix);
    }

    private static function withSuffix(string $url, ?string $suffix): string
    {
        if (! is_string($suffix) || $suffix === '') {
            return $url;
        }

        return str_contains($url, '?')
            ? $url.'&'.$suffix
            : $url.'?'.$suffix;
    }
}

