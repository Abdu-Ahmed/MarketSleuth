<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'device_id',
        'expires_at',
        'revoked_at',
        'user_agent',
        'ip_address',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    /**
     * Relationship with user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the refresh token is valid.
     */
    public function isValid(): bool
    {
        return is_null($this->revoked_at) && 
               $this->expires_at->isAfter(now());
    }

    /**
     * Revoke this refresh token.
     */
    public function revoke(): void
    {
        $this->update(['revoked_at' => now()]);
    }

    /**
     * Scope for valid tokens.
     */
    public function scopeValid($query)
    {
        return $query->whereNull('revoked_at')
                    ->where('expires_at', '>', now());
    }
}