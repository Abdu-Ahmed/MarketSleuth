<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use App\Models\Earning;
use App\Models\AnalystAction;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FetchEvents extends Command
{
    protected $signature = 'fetch:events {--skip-earnings} {--skip-analyst} {--skip-conference} {--skip-13f}';
    protected $description = 'Fetch financial events using Polygon.io and other free APIs';

    private $client;
    private $polygonKey;
    private $newsKey;
    private $rateLimitDelay = 13; // 13 seconds between requests for 5/minute limit + buffer

    public function handle()
    {
        $this->info('Starting events fetch with Polygon.io...');
        
        $this->client = new Client(['timeout' => 30]);
        $this->polygonKey = config('services.plygn.key');
        $this->newsKey = config('services.newsdata.key');

        // Validate API keys
        if (empty($this->polygonKey)) {
            $this->error('Polygon API key not configured in services.polygon.key');
            return 1;
        }

        $results = [
            'earnings' => false,
            'analyst_actions' => false,
            'conferences' => false,
            '13f_filings' => false
        ];

        // Fetch earnings using Polygon.io
        if (!$this->option('skip-earnings')) {
            $results['earnings'] = $this->fetchEarnings();
        }

        // Fetch analyst actions from news
        if (!$this->option('skip-analyst')) {
            $results['analyst_actions'] = $this->fetchAnalystActions();
        }

        // Fetch conference events
        if (!$this->option('skip-conference')) {
            $results['conferences'] = $this->fetchConferenceEvents();
        }

        // Fetch insider trading/13F data
        if (!$this->option('skip-13f')) {
            $results['13f_filings'] = $this->fetchInsiderTrading();
        }

        $this->displaySummary($results);
        return 0;
    }

    private function fetchEarnings(): bool
    {
        $this->info('Fetching earnings using Polygon.io...');
        
        try {
            $symbols = $this->getWatchlistSymbols();
            $start = Carbon::today();
            $end = Carbon::today()->addDays(7);
            
            // Clear existing earnings for the period
            Earning::whereBetween('report_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])->delete();
            
            $earningsCount = 0;
            $requestCount = 0;
            
            foreach ($symbols as $symbol) {
                if ($requestCount >= 4) { // Stay well under 5/minute limit
                    $this->info('Rate limit approaching, taking a break...');
                    sleep(60); // Wait a full minute
                    $requestCount = 0;
                }
                
                try {
                    // Get company details first to verify symbol exists
                    $this->info("Fetching company details for {$symbol}...");
                    $response = $this->client->get("https://api.polygon.io/v3/reference/tickers/{$symbol}", [
                        'query' => ['apikey' => $this->polygonKey]
                    ]);
                    
                    $data = json_decode($response->getBody(), true);
                    $requestCount++;
                    
                    if (isset($data['results']) && !empty($data['results'])) {
                        $companyData = $data['results'];
                        
                        // Try to get earnings data from company financials
                        sleep($this->rateLimitDelay);
                        $earningsData = $this->fetchPolygonEarnings($symbol);
                        $requestCount++;
                        
                        if (!empty($earningsData)) {
                            foreach ($earningsData as $earning) {
                                $reportDate = Carbon::parse($earning['date']);
                                if ($reportDate->between($start, $end)) {
                                    Earning::create([
                                        'symbol' => $symbol,
                                        'report_date' => $reportDate->format('Y-m-d'),
                                        'time_of_day' => $earning['time'] ?? 'unknown',
                                        'source' => 'polygon'
                                    ]);
                                    $earningsCount++;
                                }
                            }
                        } else {
                            // If no specific earnings data, create placeholder based on quarterly pattern
                            $this->createEstimatedEarnings($symbol, $start, $end);
                            $earningsCount++;
                        }
                    }
                    
                    sleep($this->rateLimitDelay);
                    
                } catch (RequestException $e) {
                    if ($e->getResponse() && $e->getResponse()->getStatusCode() === 429) {
                        $this->warn("Rate limit hit for {$symbol}, waiting 60 seconds...");
                        sleep(60);
                        $requestCount = 0;
                        continue;
                    }
                    $this->warn("Failed to fetch earnings for {$symbol}: " . $e->getMessage());
                }
            }
            
            $this->info("Processed earnings data for {$earningsCount} events");
            return $earningsCount > 0;
            
        } catch (\Exception $e) {
            $this->error('Earnings fetch error: ' . $e->getMessage());
            Log::error('Earnings fetch failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    private function fetchPolygonEarnings(string $symbol): array
    {
        try {
            // Try to get financial data that might include earnings dates
            $response = $this->client->get("https://api.polygon.io/vX/reference/financials", [
                'query' => [
                    'ticker' => $symbol,
                    'limit' => 4,
                    'apikey' => $this->polygonKey
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            $earnings = [];
            
            if (isset($data['results']) && !empty($data['results'])) {
                foreach ($data['results'] as $financial) {
                    if (isset($financial['filing_date'])) {
                        // Estimate earnings call date (usually 1-2 days after filing)
                        $filingDate = Carbon::parse($financial['filing_date']);
                        $estimatedEarningsDate = $filingDate->addDays(1);
                        
                        if ($estimatedEarningsDate->isFuture() && $estimatedEarningsDate->diffInDays() <= 30) {
                            $earnings[] = [
                                'date' => $estimatedEarningsDate->format('Y-m-d'),
                                'time' => 'after_market',
                                'source' => 'polygon_estimated'
                            ];
                        }
                    }
                }
            }
            
            return $earnings;
            
        } catch (\Exception $e) {
            return [];
        }
    }

    private function createEstimatedEarnings(string $symbol, Carbon $start, Carbon $end): void
    {
        // Create estimated earnings based on quarterly pattern
        // Most companies report quarterly, so estimate next earnings
        $quarterMonths = [1, 4, 7, 10]; // Jan, Apr, Jul, Oct
        $currentMonth = Carbon::now()->month;
        
        $nextQuarterMonth = null;
        foreach ($quarterMonths as $month) {
            if ($month > $currentMonth) {
                $nextQuarterMonth = $month;
                break;
            }
        }
        
        if (!$nextQuarterMonth) {
            $nextQuarterMonth = $quarterMonths[0]; // January of next year
        }
        
        $estimatedDate = Carbon::create(Carbon::now()->year, $nextQuarterMonth, 15);
        if ($nextQuarterMonth <= $currentMonth) {
            $estimatedDate->addYear();
        }
        
        if ($estimatedDate->between($start, $end)) {
            Earning::create([
                'symbol' => $symbol,
                'report_date' => $estimatedDate->format('Y-m-d'),
                'time_of_day' => 'estimated',
                'source' => 'estimated'
            ]);
        }
    }

    private function fetchAnalystActions(): bool
    {
        $this->info('Fetching analyst actions from news...');
        
        try {
            $actions = [];
            
            // Method 1: NewsData.io (if available)
            if (!empty($this->newsKey)) {
                $actions = array_merge($actions, $this->fetchNewsDataAnalystActions());
            }
            
            // Method 2: Parse from free financial news sources
            $actions = array_merge($actions, $this->scrapeAnalystActions());
            
            // Method 3: Try to get analyst data from Polygon (if available in free tier)
            $actions = array_merge($actions, $this->fetchPolygonAnalystActions());
            
            // Clear old actions
            AnalystAction::where('action_date', '>=', Carbon::now()->subDays(7))->delete();
            
            $actionsCount = 0;
            foreach ($actions as $action) {
                try {
                    AnalystAction::create($action);
                    $actionsCount++;
                } catch (\Exception $e) {
                    // Skip duplicates
                }
            }
            
            $this->info("Imported {$actionsCount} analyst actions");
            return $actionsCount > 0;
            
        } catch (\Exception $e) {
            $this->error('Analyst actions error: ' . $e->getMessage());
            return false;
        }
    }

    private function fetchPolygonAnalystActions(): array
    {
        $actions = [];
        
        try {
            $symbols = array_slice($this->getWatchlistSymbols(), 0, 3); // Limit due to rate limits
            
            foreach ($symbols as $symbol) {
                try {
                    // Try to get news that might contain analyst actions
                    $this->info("Checking Polygon news for {$symbol}...");
                    $response = $this->client->get("https://api.polygon.io/v2/reference/news", [
                        'query' => [
                            'ticker' => $symbol,
                            'limit' => 10,
                            'apikey' => $this->polygonKey
                        ]
                    ]);
                    
                    $data = json_decode($response->getBody(), true);
                    
                    if (isset($data['results'])) {
                        foreach ($data['results'] as $article) {
                            $title = $article['title'] ?? '';
                            $description = $article['description'] ?? '';
                            $content = $title . ' ' . $description;
                            
                            // Parse for analyst actions
                            if (preg_match('/(upgrade|downgrade|initiate|maintain|buy|sell|hold)/i', $content, $matches)) {
                                if (preg_match('/([A-Z]{2,5})/i', $content, $symbolMatch)) {
                                    $actions[] = [
                                        'symbol' => strtoupper($symbolMatch[1]),
                                        'action_date' => Carbon::parse($article['published_utc']),
                                        'action_type' => strtolower($matches[1]),
                                        'source_url' => $article['article_url'] ?? null,
                                        'title' => $title,
                                        'from_rating' => null,
                                        'to_rating' => null
                                    ];
                                }
                            }
                        }
                    }
                    
                    sleep($this->rateLimitDelay);
                    
                } catch (RequestException $e) {
                    if ($e->getResponse() && $e->getResponse()->getStatusCode() === 429) {
                        $this->warn("Rate limit hit, slowing down...");
                        sleep(60);
                        continue;
                    }
                }
            }
            
        } catch (\Exception $e) {
            // Silent fail
        }
        
        return $actions;
    }

    private function fetchNewsDataAnalystActions(): array
    {
        try {
            $response = $this->client->get("https://newsdata.io/api/1/news", [
                'query' => [
                    'apikey' => $this->newsKey,
                    'q' => 'analyst upgrade OR analyst downgrade OR price target OR buy rating OR sell rating',
                    'category' => 'business',
                    'language' => 'en',
                    'size' => 50
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            $stories = $data['results'] ?? [];
            
            return $this->parseAnalystActions($stories);
            
        } catch (\Exception $e) {
            return [];
        }
    }

    private function scrapeAnalystActions(): array
    {
        $actions = [];
        
        try {
            // Scrape from free financial news RSS feeds
            $feeds = [
                'https://feeds.finance.yahoo.com/rss/2.0/headline',
                'https://feeds.marketwatch.com/marketwatch/realtimeheadlines/',
            ];
            
            foreach ($feeds as $feedUrl) {
                try {
                    $feed = @simplexml_load_file($feedUrl);
                    if ($feed && isset($feed->channel->item)) {
                        $items = [];
                        foreach ($feed->channel->item as $item) {
                            $items[] = [
                                'title' => (string)$item->title,
                                'pubDate' => (string)$item->pubDate,
                                'link' => (string)$item->link
                            ];
                        }
                        $actions = array_merge($actions, $this->parseAnalystActions($items));
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }
            
        } catch (\Exception $e) {
            // Silent fail
        }
        
        return $actions;
    }

    private function parseAnalystActions(array $stories): array
    {
        $actions = [];
        
        $patterns = [
            '/([A-Z]{2,5})\s+.*?(upgraded|downgraded|initiated|maintained).*?to\s+([^,\s]+)(?:\s+from\s+([^,\s]+))?/i',
            '/(upgraded|downgraded|initiated|maintained)\s+([A-Z]{2,5}).*?to\s+([^,\s]+)(?:\s+from\s+([^,\s]+))?/i',
            '/([A-Z]{2,5})\s+gets?\s+(buy|sell|hold|neutral|outperform|underperform)/i',
            '/analyst.{0,20}(upgrades|downgrades|initiates).{0,20}([A-Z]{2,5})/i'
        ];
        
        foreach ($stories as $story) {
            $title = $story['title'] ?? '';
            $content = $title . ' ' . ($story['description'] ?? '');
            
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $content, $matches)) {
                    $symbol = '';
                    $action = '';
                    $toRating = '';
                    $fromRating = '';
                    
                    // Extract based on pattern
                    if (isset($matches[1]) && preg_match('/^[A-Z]{2,5}$/', $matches[1])) {
                        $symbol = $matches[1];
                        $action = $matches[2] ?? '';
                        $toRating = $matches[3] ?? '';
                        $fromRating = $matches[4] ?? '';
                    } elseif (isset($matches[2]) && preg_match('/^[A-Z]{2,5}$/', $matches[2])) {
                        $action = $matches[1];
                        $symbol = $matches[2];
                        $toRating = $matches[3] ?? '';
                        $fromRating = $matches[4] ?? '';
                    }
                    
                    if (!empty($symbol) && !empty($action)) {
                        $actions[] = [
                            'symbol' => strtoupper($symbol),
                            'action_date' => Carbon::parse($story['pubDate'] ?? now()),
                            'from_rating' => $fromRating ?: null,
                            'to_rating' => $toRating ?: null,
                            'action_type' => strtolower($action),
                            'source_url' => $story['link'] ?? null,
                            'title' => $title
                        ];
                        break;
                    }
                }
            }
        }
        
        return $actions;
    }

    private function fetchConferenceEvents(): bool
    {
        $this->info('Fetching conference events...');
        
        try {
            Event::where('type', 'conference')->delete();
            $eventsCount = 0;
            
            // Method 1: Parse earnings calls from Polygon news
            $eventsCount += $this->parsePolygonConferenceEvents();
            
            // Method 2: Parse from general news
            if (!empty($this->newsKey)) {
                $eventsCount += $this->parseConferenceFromNews();
            }
            
            $this->info("Imported {$eventsCount} conference events");
            return $eventsCount > 0;
            
        } catch (\Exception $e) {
            $this->error('Conference events error: ' . $e->getMessage());
            return false;
        }
    }

    private function parsePolygonConferenceEvents(): int
    {
        $count = 0;
        
        try {
            $symbols = array_slice($this->getWatchlistSymbols(), 0, 3); // Limit for rate limits
            
            foreach ($symbols as $symbol) {
                try {
                    $this->info("Fetching conference events for {$symbol}...");
                    $response = $this->client->get("https://api.polygon.io/v2/reference/news", [
                        'query' => [
                            'ticker' => $symbol,
                            'limit' => 10,
                            'apikey' => $this->polygonKey
                        ]
                    ]);
                    
                    $data = json_decode($response->getBody(), true);
                    
                    if (isset($data['results'])) {
                        foreach ($data['results'] as $article) {
                            $title = $article['title'] ?? '';
                            if (preg_match('/(earnings call|investor conference|webcast|quarterly results)/i', $title)) {
                                Event::create([
                                    'symbol' => $symbol,
                                    'event_date' => Carbon::parse($article['published_utc']),
                                    'type' => 'conference',
                                    'title' => $title,
                                    'link' => $article['article_url'] ?? null,
                                ]);
                                $count++;
                            }
                        }
                    }
                    
                    sleep($this->rateLimitDelay);
                    
                } catch (RequestException $e) {
                    if ($e->getResponse() && $e->getResponse()->getStatusCode() === 429) {
                        $this->warn("Rate limit hit for conferences, slowing down...");
                        sleep(60);
                        continue;
                    }
                }
            }
            
        } catch (\Exception $e) {
            // Silent fail
        }
        
        return $count;
    }

    private function parseConferenceFromNews(): int
    {
        try {
            $response = $this->client->get("https://newsdata.io/api/1/news", [
                'query' => [
                    'apikey' => $this->newsKey,
                    'q' => 'earnings call OR investor conference OR earnings webcast',
                    'category' => 'business',
                    'language' => 'en',
                    'size' => 20
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            $stories = $data['results'] ?? [];
            
            $eventsCount = 0;
            foreach ($stories as $story) {
                if (preg_match('/([A-Z]{2,5})\s+.*?(earnings call|conference|webcast)/i', $story['title'], $matches)) {
                    Event::create([
                        'symbol' => $matches[1],
                        'event_date' => Carbon::parse($story['pubDate']),
                        'type' => 'conference',
                        'title' => $story['title'],
                        'link' => $story['link'] ?? null,
                    ]);
                    $eventsCount++;
                }
            }
            
            return $eventsCount;
            
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function fetchInsiderTrading(): bool
    {
        $this->info('Fetching insider trading/13F data...');
        
        try {
            Event::where('type', '13f')->delete();
            $filingsCount = 0;
            
            // Method 1: Try to get insider data from Polygon (if available)
            $filingsCount += $this->fetchPolygonInsiderData();
            
            // Method 2: Parse from news sources
            if (!empty($this->newsKey)) {
                $filingsCount += $this->parseInsiderTradingFromNews();
            }
            
            // Method 3: SEC EDGAR RSS (completely free)
            $filingsCount += $this->fetchSECFilings();
            
            $this->info("Imported {$filingsCount} insider trading events");
            return $filingsCount > 0;
            
        } catch (\Exception $e) {
            $this->error('Insider trading error: ' . $e->getMessage());
            return false;
        }
    }

    private function fetchPolygonInsiderData(): int
    {
        $count = 0;
        
        try {
            $symbols = array_slice($this->getWatchlistSymbols(), 0, 2); // Very limited due to rate constraints
            
            foreach ($symbols as $symbol) {
                try {
                    // Check if Polygon has insider trading data (might not be in free tier)
                    $this->info("Checking insider data for {$symbol}...");
                    $response = $this->client->get("https://api.polygon.io/v2/reference/news", [
                        'query' => [
                            'ticker' => $symbol,
                            'limit' => 5,
                            'apikey' => $this->polygonKey
                        ]
                    ]);
                    
                    $data = json_decode($response->getBody(), true);
                    
                    if (isset($data['results'])) {
                        foreach ($data['results'] as $article) {
                            $title = $article['title'] ?? '';
                            if (preg_match('/(insider|13F|institutional)/i', $title)) {
                                Event::create([
                                    'symbol' => $symbol,
                                    'event_date' => Carbon::parse($article['published_utc']),
                                    'type' => '13f',
                                    'title' => $title,
                                    'link' => $article['article_url'] ?? null,
                                ]);
                                $count++;
                            }
                        }
                    }
                    
                    sleep($this->rateLimitDelay);
                    
                } catch (RequestException $e) {
                    if ($e->getResponse() && $e->getResponse()->getStatusCode() === 429) {
                        $this->warn("Rate limit hit for insider data, slowing down...");
                        sleep(60);
                        continue;
                    }
                }
            }
            
        } catch (\Exception $e) {
            // Silent fail
        }
        
        return $count;
    }

    private function parseInsiderTradingFromNews(): int
    {
        $count = 0;
        
        try {
            $response = $this->client->get("https://newsdata.io/api/1/news", [
                'query' => [
                    'apikey' => $this->newsKey,
                    'q' => 'insider trading OR insider buying OR insider selling OR 13F filing',
                    'category' => 'business',
                    'language' => 'en',
                    'size' => 20
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            $stories = $data['results'] ?? [];
            
            foreach ($stories as $story) {
                if (preg_match('/([A-Z]{2,5}).*?(insider|13F)/i', $story['title'], $matches)) {
                    Event::create([
                        'symbol' => $matches[1],
                        'event_date' => Carbon::parse($story['pubDate']),
                        'type' => '13f',
                        'title' => $story['title'],
                        'link' => $story['link'] ?? null,
                    ]);
                    $count++;
                }
            }
        } catch (\Exception $e) {
            // Silent fail
        }
        
        return $count;
    }

    private function fetchSECFilings(): int
    {
        $count = 0;
        
        try {
            // SEC EDGAR RSS feed (completely free)
            $feed = @simplexml_load_file("https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&CIK=&type=4&company=&dateb=&owner=include&start=0&count=40&output=atom");
            
            if ($feed) {
                foreach ($feed->entry as $entry) {
                    $title = (string)$entry->title;
                    $updated = (string)$entry->updated;
                    $link = (string)$entry->link['href'];
                    
                    // Extract symbol from title
                    if (preg_match('/\(([A-Z]{1,5})\)/', $title, $matches)) {
                        Event::create([
                            'symbol' => $matches[1],
                            'event_date' => Carbon::parse($updated),
                            'type' => '13f',
                            'title' => $title,
                            'link' => $link,
                        ]);
                        $count++;
                    }
                }
            }
        } catch (\Exception $e) {
            // Silent fail
        }
        
        return $count;
    }

    private function getWatchlistSymbols(): array
    {
        return [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
            'CRM', 'ORCL', 'AMD', 'INTC', 'ADBE', 'PYPL', 'SHOP'
        ];
    }

    private function displaySummary(array $results): void
    {
        $this->info('=== POLYGON.IO FETCH SUMMARY ===');
        
        foreach ($results as $type => $success) {
            $status = $success ? '✓' : '✗';
            $this->line("{$status} " . ucwords(str_replace('_', ' ', $type)));
        }
        
        // Display counts
        $earningsCount = Earning::whereBetween('report_date', [
            Carbon::today()->format('Y-m-d'),
            Carbon::today()->addDays(7)->format('Y-m-d')
        ])->count();
        
        $actionsCount = AnalystAction::where('action_date', '>=', Carbon::now()->subDays(7))->count();
        $conferencesCount = Event::where('type', 'conference')->count();
        $filingsCount = Event::where('type', '13f')->count();
        
        $this->info("Earnings: {$earningsCount}");
        $this->info("Analyst Actions: {$actionsCount}");
        $this->info("Conferences: {$conferencesCount}");
        $this->info("Insider Trading: {$filingsCount}");
        
        $this->info('Primary API: Polygon.io (free tier - 5 requests/minute)');
        $this->info('Rate limiting: Enabled (13 second delays)');
    }
}