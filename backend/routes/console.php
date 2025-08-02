<?php
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is automatically loaded by Laravel. You can define and schedule
| your console commands here using app(Schedule::class).
|
*/

// 1) Schedule Form 4 fetch
Artisan::command('schedule:form4', function () {
    $this->comment('Running Form4 fetch schedule…');
    Artisan::call('fetch:form4', ['ticker' => 'AAPL']);
})->describe('Fetch Form4 filings for configured tickers');

app(Schedule::class)->command('schedule:form4')
    ->dailyAt('02:00')
    ->description('Scheduled daily SEC Form 4 fetch');

// 2) Schedule Dividends fetch
Artisan::command('schedule:dividends', function () {
    $this->comment('Running Dividend fetch schedule…');
    Artisan::call('fetch:dividends', ['ticker' => 'AAPL']);
})->describe('Fetch dividends for configured tickers');

app(Schedule::class)->command('schedule:dividends')
    ->weekly()
    ->mondays()
    ->at('03:00')
    ->description('Scheduled weekly Dividend fetch');

// 3) Schedule Options fetch
Artisan::command('schedule:options', function () {
    $this->comment('Running Options fetch schedule…');
    Artisan::call('fetch:options', ['ticker' => 'AAPL']);
})->describe('Fetch options for configured tickers');

app(Schedule::class)->command('schedule:options')
    ->weekly()
    ->mondays()
    ->at('04:00')
    ->description('Scheduled weekly Options fetch');

// 4) Schedule Tickers fetch
Artisan::command('schedule:tickers', function () {
    $this->comment('Running Tickers fetch schedule…');
    Artisan::call('fetch:tickers');
})->describe('Fetch market data for configured tickers');

app(Schedule::class)->command('schedule:tickers')
    ->everyFiveMinutes()
    ->between('9:30', '16:00')
    ->weekdays()
    ->description('Fetch market data every 5 minutes during market hours');

// Compute metrics
app(Schedule::class)->command('compute:metrics')
    ->dailyAt('05:00')
    ->description('Compute ticker-level metrics daily');

// Run Scanner   
app(Schedule::class)
    ->command('scan:run 1')
    ->hourly()
    ->description('Hourly run for scanner #1');

app(Schedule::class)->command('fetch:events')
    ->dailyAt('02:00')
    ->description('Fetch earnings, analyst actions, conferences & 13F events');

app(Schedule::class)->command('alerts:process')
    ->everyFiveMinutes()
    ->description('Check and fire user alerts');

