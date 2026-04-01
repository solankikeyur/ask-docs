<?php

namespace App\Http\FortifyResponses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        /** @var Request $request */
        return redirect()->to(RedirectAfterAuthentication::to($request));
    }
}

