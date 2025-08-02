<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Alert;
use App\Models\RefreshToken;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Role constants for easier management
     */
    const ROLE_USER = 'user';
    const ROLE_ADMIN = 'admin';

    /**
     * Get all available roles
     */
    public static function getRoles(): array
    {
        return [
            self::ROLE_USER,
            self::ROLE_ADMIN,
        ];
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is a regular user
     */
    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Set user role
     */
    public function setRole(string $role): void
    {
        if (in_array($role, self::getRoles())) {
            $this->role = $role;
            $this->save();
        }
    }

    /**
     * Get the identifier that will be stored in the JWT subject claim.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'email' => $this->email,
            'name' => $this->name,
            'role' => $this->role,
            'email_verified' => !is_null($this->email_verified_at),
            'iss' => config('app.name'), // Issuer
            'aud' => config('app.url'),  // Audience
        ];
    }

    /**
     * Relationship with refresh tokens.
     */
    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    /**
     * Create a new refresh token for this user.
     */
    public function createRefreshToken(string $deviceId = null): RefreshToken
    {
        // Revoke existing refresh tokens for this device (optional)
        if ($deviceId) {
            $this->refreshTokens()
                ->where('device_id', $deviceId)
                ->where('expires_at', '>', now())
                ->update(['revoked_at' => now()]);
        }

        return $this->refreshTokens()->create([
            'token' => bin2hex(random_bytes(64)),
            'device_id' => $deviceId,
            'expires_at' => now()->addDays(30), // Refresh token valid for 30 days
            'user_agent' => request()->header('User-Agent'),
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Revoke all refresh tokens for this user.
     */
    public function revokeAllRefreshTokens(): void
    {
        $this->refreshTokens()
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * Revoke refresh tokens for a specific device.
     */
    public function revokeRefreshTokensForDevice(string $deviceId): void
    {
        $this->refreshTokens()
            ->where('device_id', $deviceId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * Relationship with alerts.
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * Scope to filter by role
     */
    public function scopeWithRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope to get only admin users
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', self::ROLE_ADMIN);
    }

    /**
     * Scope to get only regular users
     */
    public function scopeUsers($query)
    {
        return $query->where('role', self::ROLE_USER);
    }
}