MarketSleuth
A unified investor dashboard that aggregates traditional and alternative financial data into one seamless web application. MarketSleuth is somewhat of a saas application and it provides real-time market data, insider trading filings, dividend and options income projections, sentiment analysis, custom stock scanners, earnings/events monitoring, a trade journal, alerts, user settings, and extensible data-source management.

🏗️ Architecture & Technology Stack
Layer	Technology
Backend	Laravel 12, PHP 8.2, MySQL, Redis
Auth	JWT (tymon/jwt-auth), per-device refresh tokens
Frontend	React, Vite, Tailwind CSS, Framer Motion, Lucide-React
Containerization	Docker Compose (PHP-FPM, Nginx, MySQL, Redis, Node)

Database (MySQL): primary persistence for users, journal entries, scanners, option positions, dividends, earnings/events, alerts, settings, data sources.

Cache (Redis): stores rate-limiting counters, queue jobs, and can be extended for response caching (e.g. market tickers).

Queues & Scheduler: Laravel’s job queue for heavy fetch tasks; scheduled Artisan commands (fetch:form4, fetch:dividends, fetch:options, scan:run) run periodically to keep alt-data fresh.

📦 Core Features & Data Flows
1. Authentication & User Management
JWT Access Tokens with 15-minute TTL; Refresh Tokens stored in refresh_tokens table (30-day TTL), revocable per‐device.

Endpoints:

POST /api/register → create new user (rate-limited, email DNS-validated, strong password enforced)

POST /api/login / POST /api/refresh / POST /api/logout / POST /api/logout-all

GET /api/me → returns authenticated user profile

2. Market Data
Live Quotes & History served via MarketDataController from third-party APIs, optionally cached in Redis.

GET /api/market/tickers

GET /api/market/ticker/{symbol}

GET /api/market/ticker/{symbol}/history

3. Insider Trading (Form 4)
Artisan Job: fetch:form4 {ticker} retrieves SEC Form 4 filings and stores in form4_records.

API Endpoint: GET /api/tickers/{symbol}/insiders returns count + recent filings.

4. Dividend & Options Income Projections
Dividend Fetcher: fetch:dividends {ticker} pulls monthly ex-dividend data; stored in dividend_records.

Options Fetcher: fetch:options {ticker} (Polygon.io integration) populates option_positions.

Endpoints:

GET /api/income/dividends/{symbol} → total & monthly projections + raw records

GET /api/income/options/{symbol} → positions array + yield/income summary

5. Custom Stock Scanners
Scanner Model: user-defined JSON criteria stored in scanners table.

Execution: php artisan scan:run {scannerId} filters Tickers via criteria (e.g. dividend yield, insider buys).

Protected API:

GET /api/scanners → list user’s scanners

POST /api/scanners → create new

GET /api/scanners/{id}/results → run & return matches

Built-in Public Scanners:

GET /api/scanners/high-dividend

GET /api/scanners/insider-activity

6. Earnings & Events Monitor
Events Models: EarningEvent and AnalystAction track upcoming earnings and analyst upgrades/downgrades.

Endpoints:

GET /api/events/earnings/upcoming

GET /api/events/analyst/{symbol}

GET /api/events/all

7. Trade Journal & Alerts
Journal Entries: journal_entries table for buy/sell/note entries (quantity, price, P&L, tags, attachments).

Alerts: user-configured records in alerts table; trigger based on events or thresholds.

CRUD Endpoints (protected): /api/journal and /api/alerts

8. Options Simulator
Simulation Endpoint: POST /api/options/simulate reads from option_positions to calculate P/L for a given ticker, strike, expiry.

9. Settings & Data Sources
User Settings (protected):

GET /api/settings/profile, PUT /api/settings/profile → view/update name & email

PUT /api/settings/password → change password

Data Sources (public view; admin edit):

GET /api/data-sources & GET /api/data-sources/{id}

Admin-only: POST / PUT / DELETE to manage feed configurations

🔄 Interactions & Caching
Scheduler enqueues fetch jobs overnight (via routes/console.php scheduling).

Fetchers write to SQL tables; option_positions and dividend_records are used by projection endpoints.

Redis holds ephemeral rate-limiter keys and job queues; can be extended to cache API responses (e.g. market ticks).

Frontend uses a custom React hook (useDashboardData) to orchestrate parallel fetches of all card-level APIs, handles loading/error states, and triggers re‐fetch on “Refresh Data.”

🔄 Data Flow Example: Insider Buys Card
Artisan: php artisan fetch:form4 AAPL → fetch & store filings in form4_records.

Cache: Optionally store “latest fetch timestamp” in Redis for freshness indicator.

API: GET /api/tickers/AAPL/insiders queries MySQL for count & recent records.

Frontend: useDashboardData calls endpoint, populates data.insider, renders a card.

🧩 Component Breakdown
DashboardHeader: search bar + refresh button → calls refreshData() to re-run all fetches.

Sidebar: global navigation reflecting implemented features.

DashboardCard: generic card component handles loading, error, main metric, and optional details list.

OptionsSummary & IncomeSummary: detailed breakdown UIs for options and dividend projections.
