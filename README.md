# News Aggregator Platform

Platformă de agregare știri cu clasificare AI, scoring de relevanță și notificări în timp real, rulată integral în Docker pe WSL2.

## Stack tehnic

| Componentă | Tehnologie |
|---|---|
| Backend | Laravel 11 + FrankenPHP |
| Frontend | React + Vite + TypeScript |
| Bază de date relațională | MySQL 8 |
| Bază de date documente | MongoDB 7 |
| Cache & Queue | Redis 7 |
| Search | Elasticsearch 8.19 + Laravel Scout (`babenkoivan/elastic-scout-driver`) |
| Broadcasting / WebSockets | Soketi (compatibil Pusher protocol) |
| AI | OpenAI API (clasificare articole) |
| Monitorizare cozi | Laravel Horizon |
| Observabilitate | Prometheus + Grafana |
| Admin DB | phpMyAdmin |

## Arhitectură — servicii Docker

```
laravel_app        → FrankenPHP, servește API-ul HTTP (:8000)
laravel_worker      → Horizon, procesează cozile Redis (FetchNewsJob, ProcessArticlesBatchJob, ClassifyArticlesAI, CalculateArticleScoreJob, ArticleCreated broadcast)
laravel_scheduler   → schedule:work, declanșează FetchNewsJob periodic
frontend            → Vite dev server (:5173)
mysql               → date relaționale: users, categories, sources, subscriptions (:3307 host)
mongodb             → colecția articles, cu conținut integral + raw payload (:27018 host)
redis               → queue + cache (:6380 host)
elasticsearch       → indexare full-text pentru search (:9200)
soketi              → server WebSocket local, protocol Pusher (:6001 client, :9601 admin)
prometheus          → colectare metrici (:9090)
grafana             → dashboard-uri (:3000)
phpmyadmin          → UI admin MySQL (:8081)
```

## Pornire rapidă

```bash
git clone <repo>
cd news_aggregator_platform
cp backend/.env.example backend/.env    # completează OPENAI_API_KEY
docker compose up -d --force-recreate
```

Verifică starea tuturor serviciilor:
```bash
docker compose ps
```
Toate ar trebui să fie `Up`, iar `laravel_app`, `mysql`, `elasticsearch` marcate `(healthy)`. `laravel_worker` și `laravel_scheduler` nu au healthcheck (nu servesc HTTP) — starea lor se verifică prin loguri, nu prin coloana STATUS.

## Comenzi curente de dezvoltare

**Loguri live per serviciu:**
```bash
docker compose logs -f laravel_worker
docker compose logs -f soketi
docker compose logs -f laravel_app
```

**Log Laravel (aplicație):**
```bash
docker compose exec laravel_worker tail -f storage/logs/laravel.log
```

**Rulare artisan:**
```bash
docker compose exec laravel_app php artisan <comanda>
```

**Acces Horizon (monitor cozi):**
```
http://127.0.0.1:8000/horizon
```

**Declanșare manuală fetch știri:**
```bash
docker compose exec laravel_worker php artisan tinker --execute="App\Jobs\FetchNewsJob::dispatch();"
```

**Test manual broadcast (bypass fetch, verificare rapidă WebSocket):**
```bash
docker compose exec laravel_worker php artisan tinker --execute="App\Jobs\ProcessArticlesBatchJob::dispatchSync([['title' => 'Test', 'url' => 'https://example.com/test-'.time(), 'description' => 'test', 'source' => 'Manual']]); echo 'DONE';"
```

**Config cache — de rulat după orice schimbare de `.env` sau `config/*.php`:**
```bash
docker compose exec laravel_app php artisan config:clear
docker compose exec laravel_worker php artisan config:clear
docker compose restart laravel_worker laravel_app
```

**Restart curat complet (elimină procese Horizon stale):**
```bash
docker compose down
docker compose up -d --force-recreate
```

**Repornire doar Horizon (fără a recrea containerul):**
```bash
docker compose exec laravel_worker php artisan horizon:terminate
```
Supervisorul Horizon repornește automat workerii cu config proaspăt.

## Fluxul de date

```
FetchNewsJob (scheduler, la 5 min)
    ↓ pentru fiecare Source (RSS/API)
    ↓ deduplicare pe URL
ProcessArticlesBatchJob
    ↓ salvare Article în MongoDB
    ↓ clasificare pe cuvinte-cheie (categorii existente)
    ↓ dacă needs_ai=true → marcat pentru clasificare AI
    ↓ event(ArticleCreated) — broadcast pe canalul privat category.{id}
        ↓
ClassifyArticlesAI (job separat, batch de 10 articole needs_ai=true)
    ↓ OpenAI API → returnează slug categorie
    ↓ update category_id, needs_ai=false

CalculateArticleScoreJob
    ↓ calculează scor de relevanță (folosește Elasticsearch)

ArticleCreated (event, ShouldBroadcast)
    ↓ Laravel Broadcasting → Soketi (:6001)
    ↓ Soketi → toți clienții abonați la private-category.{id}
    ↓ Frontend (useCategoryNotifications hook) → notificare live, fără refresh
```

## Modele principale

- **User** — auth JWT, roluri Spatie (admin/user), `subscriptions` (belongsToMany Category)
- **Category** — categorii de știri, urmărește abonații
- **Source** — surse de știri (RSS sau API)
- **Article** (MongoDB) — conținut articol, `category_id`, `hash` pentru dedup, `needs_ai`, `ai_attempts`, `score`, `raw` (payload original)

## Autentificare & Broadcasting

- API: JWT (`tymon/jwt-auth`), guard `api`
- Canale private Laravel: `Broadcast::routes(['middleware' => ['auth:api']])`, definit **o singură dată**, în `BroadcastServiceProvider`
- Canal per categorie: `private-category.{id}`, autorizare în `routes/channels.php`
- Driver broadcasting: `pusher`, redirecționat către Soketi local prin `config/broadcasting.php` → `options.host/port/scheme`

## Variabile de mediu critice (trebuie identice în `laravel_app`, `laravel_worker`, `frontend`, `soketi`)

```
PUSHER_APP_ID=news_aggregator
PUSHER_APP_KEY=news_aggregator_key
PUSHER_APP_SECRET=news_aggregator_secret
PUSHER_HOST=soketi
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

Pentru `soketi`, aceleași valori sub prefixul `SOKETI_DEFAULT_APP_*`.
Pentru `frontend`, sub prefixul `VITE_PUSHER_*`.

## Elasticsearch

```
ELASTIC_HOST=elasticsearch:9200      # citit de babenkoivan/elastic-scout-driver
SCOUT_DRIVER=elastic
```
Notă: pachetul folosit citește `ELASTIC_HOST` (format `host:port` unic), nu `ELASTICSEARCH_HOST`/`ELASTICSEARCH_PORT` separate.

## AI

```
OPENAI_API_KEY=sk-...
```
Folosit de `AICategoryService` pentru clasificarea articolelor marcate `needs_ai=true`, rulat prin job-ul `ClassifyArticlesAI`.

## Depanare rapidă

| Simptom | Verifică |
|---|---|
| `NoNodeAvailableException` la Elasticsearch | `docker compose exec laravel_worker curl http://elasticsearch:9200` + confirmă `ELASTIC_HOST` |
| `auth_key should be a valid app key` | Verifică `config/broadcasting.php` are `options.host/port/scheme`, nu doar `cluster` |
| `App key not found` în loguri Soketi | Compară `SOKETI_DEFAULT_APP_KEY` cu `PUSHER_APP_KEY` din toate serviciile |
| WebSocket nu se conectează, erori `wss://` | Verifică `enabledTransports: ["ws"]` în `echo.ts`, nu `["ws", "wss"]` |
| `laravel_worker`/`laravel_scheduler` `(unhealthy)` | Normal — nu servesc HTTP; healthcheck dezactivat explicit în compose |
| `OpenAI API Key is missing` | `OPENAI_API_KEY` lipsă sau placeholder gol în `.env` |
| Articole `EMPTY` la fiecare fetch | Normal dacă sursele RSS n-au conținut nou — verifică dedup pe `url` în `FetchNewsJob` |

Pentru istoricul complet al problemelor găsite și rezolvate, vezi `POSTMORTEM.md`.