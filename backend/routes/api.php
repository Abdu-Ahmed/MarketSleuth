<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TickerController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ScannerController;
use App\Http\Controllers\MarketDataController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\RefreshController;
use App\Http\Controllers\OptionsController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DataSourceController;

// ─────────────────────────────────────────────────────────────────────────────
// Public Auth Routes
// ─────────────────────────────────────────────────────────────────────────────
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);
Route::post('refresh',  [AuthController::class, 'refresh']);
Route::post('check-password-strength', [AuthController::class, 'checkPasswordStrength']);

// ─────────────────────────────────────────────────────────────────────────────
// Public Data Routes (no auth required)
// ─────────────────────────────────────────────────────────────────────────────
Route::get('tickers/{symbol}/insiders',       [TickerController::class,   'insiders']);
Route::get('income/dividends/{symbol}',       [IncomeController::class,   'dividends']);
Route::get('income/options/{symbol}',         [IncomeController::class,   'options']);

Route::get('scanners/high-dividend',          [ScannerController::class,  'highDividend']);
Route::get('scanners/insider-activity',       [ScannerController::class,  'insiderActivity']);

Route::get('events/earnings/upcoming',        [EventController::class,    'earningsUpcoming']);
Route::get('events/analyst/{symbol}',         [EventController::class,    'analystBySymbol']);
Route::get('events/all',                      [EventController::class,    'all']);

Route::get('market/tickers',                  [MarketDataController::class,'getMarketTickers']);
Route::get('market/ticker/{symbol}',          [MarketDataController::class,'getTicker']);
Route::get('market/ticker/{symbol}/history',  [MarketDataController::class,'getTickerHistory']);

// ─────────────────────────────────────────────────────────────────────────────
// Protected Routes (require JWT Bearer)
// ─────────────────────────────────────────────────────────────────────────────
Route::middleware('auth:api')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('logout-all', [AuthController::class, 'logoutAll']);
    Route::get('scanners',                       [ScannerController::class, 'index']);
    Route::post('scanners',                      [ScannerController::class, 'store']);
    Route::get('scanners/{id}/results',          [ScannerController::class, 'results']);
    Route::get('journal',             [JournalController::class,'index']);
    Route::post('journal',            [JournalController::class,'store']);
    Route::get('journal/{id}',        [JournalController::class,'show']);
    Route::delete('journal/{id}',     [JournalController::class,'destroy']);
    Route::get   ('alerts',         [AlertController::class,'index']);
    Route::post  ('alerts',         [AlertController::class,'store']);
    Route::put   ('alerts/{id}',    [AlertController::class,'update']);
    Route::delete('alerts/{id}',    [AlertController::class,'destroy']);
    Route::post('options/simulate', [OptionsController::class, 'simulate']);

    // Kick off a full data refresh:
    Route::post('refresh-data', [RefreshController::class, 'refreshAll']);
    // Session management
    Route::get('sessions', [AuthController::class, 'activeSessions']);
    Route::delete('sessions/{sessionId}', [AuthController::class, 'revokeSession']);
    
      // Settings
  Route::get('settings/profile',       [SettingsController::class,'profile']);
  Route::put('settings/profile',       [SettingsController::class,'updateProfile']);
  Route::put('settings/password',      [SettingsController::class,'changePassword']);

  // Data Sources
  Route::get('data-sources',           [DataSourceController::class,'index']);

  Route::middleware('admin')->group(function () {
        Route::put('data-sources/{id}',    [DataSourceController::class, 'update']);
        Route::delete('data-sources/{id}', [DataSourceController::class, 'destroy']);
    });
});
