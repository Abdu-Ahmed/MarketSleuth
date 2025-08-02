<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use GuzzleHttp\Client;
use App\Models\Form4Record;

class FetchForm4 extends Command
{
    protected $signature = 'fetch:form4 {ticker}';
    protected $description = 'Fetch Form 4 filings for a ticker from SEC EDGAR';

    public function handle()
    {
        $ticker = strtoupper($this->argument('ticker'));
        $client = new Client(['base_uri' => 'https://api.sec.gov']);

        // Example: fetch JSON of filings (adjust endpoint as needed)
        $res = $client->get("/edgar/form4/{$ticker}.json");
        $data = json_decode($res->getBody(), true);

        foreach ($data['filings'] ?? [] as $f) {
            Form4Record::updateOrCreate(
                ['ticker' => $ticker, 'filed_at' => $f['filed_at'], 'filer_name' => $f['filer_name']],
                [
                    'transaction_type' => $f['transaction_type'],
                    'file_value'      => $f['file_value'] ?? null,
                    'shares'          => $f['shares'] ?? null,
                ]
            );
        }

        $this->info("Synced Form 4 for {$ticker}");
    }
}