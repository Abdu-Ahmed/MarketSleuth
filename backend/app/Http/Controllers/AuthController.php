<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\RefreshToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\RateLimiter;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class AuthController extends Controller
{
    /**
     * Register a new user with enhanced validation and return JWT tokens.
     */
    public function register(Request $request)
    {
        // Rate limiting
        $key = 'register-attempts:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'error' => 'Too many registration attempts. Please try again in ' . $seconds . ' seconds.'
            ], 429);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|min:2',
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                'unique:users',
                function ($attribute, $value, $fail) {
                    if (!$this->isValidEmailDomain($value)) {
                        $fail('The email domain is not valid or does not exist.');
                    }
                }
            ],
            'password' => [
                'required',
                'string',
                'min:12',
                'confirmed',
                function ($attribute, $value, $fail) {
                    $errors = $this->validatePasswordComplexity($value);
                    if (!empty($errors)) {
                        $fail(implode(' ', $errors));
                    }
                }
            ],
            'device_id' => 'nullable|string|max:255',
            'role' => 'nullable|string|in:user,admin', // Optional role field for admin registration
        ]);

        if ($validator->fails()) {
            RateLimiter::hit($key, 300);
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => strtolower($request->email),
                'password' => Hash::make($request->password),
                'role' => $request->role ?? User::ROLE_USER, // Default to 'user' role
                'email_verified_at' => null,
            ]);

            // Generate JWT token with short expiration (15 minutes)
            $accessToken = JWTAuth::fromUser($user);
            
            // Create refresh token
            $refreshToken = $user->createRefreshToken($request->device_id);

            RateLimiter::clear($key);

            return response()->json([
                'message' => 'Registration successful. Please verify your email address.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'email_verified' => false,
                ],
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken->token,
                'token_type' => 'Bearer',
                'expires_in' => config('jwt.ttl') * 60, // Convert minutes to seconds
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Registration failed. Please try again.'
            ], 500);
        }
    }

    /**
     * Authenticate user and return JWT tokens.
     */
    public function login(Request $request)
    {
        $key = 'login-attempts:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'error' => 'Too many login attempts. Please try again in ' . $seconds . ' seconds.'
            ], 429);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'device_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid input',
                'details' => $validator->errors()
            ], 422);
        }

        $credentials = [
            'email' => strtolower($request->email),
            'password' => $request->password
        ];

        try {
            if (!$accessToken = JWTAuth::attempt($credentials)) {
                RateLimiter::hit($key, 300);
                return response()->json([
                    'error' => 'Invalid credentials'
                ], 401);
            }

            $user = Auth::user();
            
            // Create refresh token
            $refreshToken = $user->createRefreshToken($request->device_id);

            RateLimiter::clear($key);

            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'email_verified' => !is_null($user->email_verified_at),
                ],
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken->token,
                'token_type' => 'Bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Could not create token'
            ], 500);
        }
    }

    /**
     * Refresh the access token using refresh token.
     */
    public function refresh(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Refresh token is required'
            ], 422);
        }

        $refreshToken = RefreshToken::where('token', $request->refresh_token)
            ->valid()
            ->first();

        if (!$refreshToken) {
            return response()->json([
                'error' => 'Invalid or expired refresh token'
            ], 401);
        }

        try {
            $user = $refreshToken->user;
            
            // Generate new access token
            $accessToken = JWTAuth::fromUser($user);
            
            // Optionally rotate refresh token for added security
            if (config('jwt.rotate_refresh_token', false)) {
                $refreshToken->revoke();
                $newRefreshToken = $user->createRefreshToken($refreshToken->device_id);
                $refreshTokenValue = $newRefreshToken->token;
            } else {
                $refreshTokenValue = $refreshToken->token;
            }

            return response()->json([
                'access_token' => $accessToken,
                'refresh_token' => $refreshTokenValue,
                'token_type' => 'Bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Could not refresh token'
            ], 500);
        }
    }

    /**
     * Get current user information.
     */
    public function me()
    {
        try {
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json(['error' => 'User not found'], 404);
            }

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified' => !is_null($user->email_verified_at),
                'created_at' => $user->created_at,
            ]);

        } catch (TokenExpiredException $e) {
            return response()->json(['error' => 'Token expired'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['error' => 'Token invalid'], 401);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token absent'], 401);
        }
    }

    /**
     * Logout user (revoke current session).
     */
    public function logout(Request $request)
    {
        try {
            JWTAuth::parseToken()->invalidate();
            
            // Revoke refresh token if provided
            if ($request->has('refresh_token')) {
                $refreshToken = RefreshToken::where('token', $request->refresh_token)
                    ->valid()
                    ->first();
                
                if ($refreshToken) {
                    $refreshToken->revoke();
                }
            }

            return response()->json([
                'message' => 'Successfully logged out'
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Failed to logout, please try again'
            ], 500);
        }
    }

    /**
     * Logout from all devices.
     */
    public function logoutAll(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Revoke all refresh tokens
            $user->revokeAllRefreshTokens();

            // Invalidate current JWT
            JWTAuth::parseToken()->invalidate();

            return response()->json([
                'message' => 'Successfully logged out from all devices'
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Failed to logout, please try again'
            ], 500);
        }
    }

    /**
     * Get all active sessions for the current user.
     */
    public function activeSessions()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $activeSessions = $user->refreshTokens()
                ->valid()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($token) {
                    return [
                        'id' => $token->id,
                        'device_id' => $token->device_id,
                        'user_agent' => $token->user_agent,
                        'ip_address' => $token->ip_address,
                        'created_at' => $token->created_at,
                        'expires_at' => $token->expires_at,
                        'is_current' => $token->token === request()->refresh_token,
                    ];
                });

            return response()->json([
                'sessions' => $activeSessions
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Token invalid'
            ], 401);
        }
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(Request $request, $sessionId)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $refreshToken = $user->refreshTokens()
                ->where('id', $sessionId)
                ->valid()
                ->first();

            if (!$refreshToken) {
                return response()->json([
                    'error' => 'Session not found or already revoked'
                ], 404);
            }

            $refreshToken->revoke();

            return response()->json([
                'message' => 'Session revoked successfully'
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Token invalid'
            ], 401);
        }
    }

    /**
     * Check password strength endpoint.
     */
    public function checkPasswordStrength(Request $request)
    {
        $password = $request->input('password');
        
        if (!$password) {
            return response()->json([
                'error' => 'Password is required'
            ], 400);
        }

        $errors = $this->validatePasswordComplexity($password);
        $strength = $this->calculatePasswordStrength($password);

        return response()->json([
            'valid' => empty($errors),
            'errors' => $errors,
            'strength' => $strength,
            'score' => $this->getPasswordScore($password)
        ]);
    }

    /**
     * Admin endpoint to change user role (requires admin privileges)
     */
    public function changeUserRole(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string|in:user,admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid role',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $currentUser = JWTAuth::parseToken()->authenticate();
            
            if (!$currentUser->isAdmin()) {
                return response()->json([
                    'error' => 'Unauthorized. Admin privileges required.'
                ], 403);
            }

            $targetUser = User::find($userId);
            
            if (!$targetUser) {
                return response()->json([
                    'error' => 'User not found'
                ], 404);
            }

            $targetUser->setRole($request->role);

            return response()->json([
                'message' => 'User role updated successfully',
                'user' => [
                    'id' => $targetUser->id,
                    'name' => $targetUser->name,
                    'email' => $targetUser->email,
                    'role' => $targetUser->role,
                ]
            ]);

        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Token invalid'
            ], 401);
        }
    }

    // Password validation methods remain the same
    private function validatePasswordComplexity($password)
    {
        $errors = [];

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter.';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter.';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number.';
        }

        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
            $errors[] = 'Password must contain at least one special character.';
        }

        if (preg_match('/(.)\1{2,}/', $password)) {
            $errors[] = 'Password cannot contain three or more consecutive identical characters.';
        }

        $commonPasswords = [
            'password123', '123456789', 'qwerty123', 'admin123',
            'welcome123', 'password1', 'letmein123'
        ];
        
        if (in_array(strtolower($password), $commonPasswords)) {
            $errors[] = 'Password is too common. Please choose a more secure password.';
        }

        return $errors;
    }

    private function isValidEmailDomain($email)
    {
        $domain = substr(strrchr($email, "@"), 1);
        return checkdnsrr($domain, 'MX') || checkdnsrr($domain, 'A');
    }

    private function calculatePasswordStrength($password)
    {
        $score = 0;
        $length = strlen($password);

        if ($length >= 12) $score += 2;
        elseif ($length >= 8) $score += 1;

        if (preg_match('/[a-z]/', $password)) $score += 1;
        if (preg_match('/[A-Z]/', $password)) $score += 1;
        if (preg_match('/[0-9]/', $password)) $score += 1;
        if (preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) $score += 2;

        if ($length >= 16) $score += 1;

        if ($score <= 3) return 'weak';
        elseif ($score <= 5) return 'medium';
        elseif ($score <= 7) return 'strong';
        else return 'very_strong';
    }

    private function getPasswordScore($password)
    {
        $score = 0;
        $length = strlen($password);

        $score += min($length * 4, 25);
        
        if (preg_match('/[a-z]/', $password)) $score += 5;
        if (preg_match('/[A-Z]/', $password)) $score += 5;
        if (preg_match('/[0-9]/', $password)) $score += 5;
        if (preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) $score += 10;

        if (preg_match('/(.)\1{2,}/', $password)) $score -= 10;
        if (preg_match('/^[a-zA-Z]+$/', $password)) $score -= 5;
        if (preg_match('/^[0-9]+$/', $password)) $score -= 10;

        return max(0, min(100, $score));
    }
}