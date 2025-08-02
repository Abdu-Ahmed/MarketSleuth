<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Alert;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;
use App\Notifications\GenericAlertNotification;

class ProcessAlerts extends Command
{
    protected $signature = 'alerts:process';
    protected $description = 'Evaluate all active alerts and send notifications if triggered';

    public function handle()
    {
        $now = Carbon::now();
        $this->info("Processing alerts at {$now}");

        $alerts = Alert::where('active', true)->get();
        foreach ($alerts as $alert) {
            $shouldTrigger = false;
            $payload       = [];

            switch ($alert->type) {
                case 'earnings':
                    // if an earnings report is within N days
                    $days = $alert->config['daysAhead'] ?? 1;
                    $due  = Carbon::today()->addDays($days);
                    $exists = \App\Models\Earning::where('symbol', $alert->symbol)
                        ->whereDate('report_date', $due)
                        ->exists();
                    if ($exists) {
                        $shouldTrigger = true;
                        $payload = [
                            'title' => "Earnings Coming Up",
                            'body'  => "{$alert->symbol} reports earnings on {$due->toDateString()}",
                        ];
                    }
                    break;

                case 'insider':
                    // if insider filed in the last N days
                    $days = $alert->config['lastDays'] ?? 1;
                    $since = Carbon::today()->subDays($days);
                    $count = \App\Models\Form4Record::where('symbol', $alert->symbol)
                        ->where('filed_at', '>=', $since)
                        ->count();
                    if ($count > 0) {
                        $shouldTrigger = true;
                        $payload = [
                            'title' => "Insider Activity",
                            'body'  => "{$count} insider trades on {$alert->symbol} in last {$days}d",
                        ];
                    }
                    break;

                case 'dividend':
                    // if ex‑dividend date is within N days
                    $days = $alert->config['daysAhead'] ?? 1;
                    $due  = Carbon::today()->addDays($days);
                    $exists = \App\Models\Dividend::where('symbol', $alert->symbol)
                        ->whereDate('ex_date', $due)
                        ->exists();
                    if ($exists) {
                        $shouldTrigger = true;
                        $payload = [
                            'title' => "Ex‑Dividend Alert",
                            'body'  => "{$alert->symbol} goes ex-dividend on {$due->toDateString()}",
                        ];
                    }
                    break;
            }

            if ($shouldTrigger) {
                // send notification
                Notification::route('mail', $alert->user->email)
                    ->notify(new GenericAlertNotification($payload));

                // update last_triggered_at
                $alert->update(['last_triggered_at' => $now]);
                $this->info("Alert #{$alert->id} triggered for user {$alert->user->email}");
            }
        }

        $this->info('Alert processing complete.');
        return 0;
    }
}
