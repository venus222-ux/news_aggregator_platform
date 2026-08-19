# Postmortem — Migrare Docker/WSL2 Full

Jurnal complet al problemelor identificate și rezolvate în timpul migrării `news_aggregator_platform` la un mediu 100% Docker pe WSL2 (Ubuntu pe Windows). Documentul urmărește ordinea reală în care problemele au fost descoperite — multe au fost mascate una de alta, iar rezolvarea uneia a expus-o pe următoarea.

---

## 1. Autorizare canale private — 401 pe `/broadcasting/auth`

**Simptom:** Frontend-ul se conecta la Soketi, dar toate abonările la canale private (`private-category.*`) eșuau cu `AuthError`, status 401.

**Cauză:** `Broadcast::routes()` era apelat de **două ori** — o dată în `routes/api.php` cu `['middleware' => ['auth:api']]`, și separat în `BroadcastServiceProvider::boot()` cu `['middleware' => ['api']]` (fără `auth:api`). A doua înregistrare câștiga la matching, deci `/broadcasting/auth` rula fără JWT parsat — `$user` ajungea `null` în closure-ul din `channels.php`.

**Fix:** Eliminată înregistrarea duplicată din `routes/api.php`. Păstrat un singur `Broadcast::routes(['middleware' => ['auth:api']])`, în `BroadcastServiceProvider`.

---

## 2. Chei Pusher/Soketi nesincronizate (config drift, runda 1)

**Simptom:** După fix-ul #1, autorizarea mergea (200 OK), dar Soketi respingea handshake-ul WebSocket cu `AuthError`.

**Cauză:** `laravel_worker` nu avea variabilele `PUSHER_*` definite explicit în `docker-compose.yml` (doar `laravel_app` le avea), deci worker-ul cădea pe valorile din `.env`, care erau vechi (`45879cb0d9cad8bd459c`), diferite de cheia pe care o aștepta Soketi (`news_aggregator_key`).

**Fix:** Adăugate explicit toate variabilele `PUSHER_*` identice în `environment:` la `laravel_worker`, `laravel_app` și `frontend` (`VITE_PUSHER_*`).

**Lecție:** Această problemă a reapărut de mai multe ori pe parcursul sesiunii, de fiecare dată cu o altă combinație de valori vechi/noi coexistând între servicii. Cauza structurală: `.env` conținea valori vechi (rămase dintr-un alt proiect boilerplate) care erau parțial suprascrise de `environment:` din compose, dar nu peste tot consecvent.

---

## 3. Elasticsearch — `NoNodeAvailableException`

**Simptom:** Joburi care ating Elasticsearch (`CalculateArticleScoreJob`) eșuau intermitent cu `No alive nodes`.

**Cauză reală (după eliminarea falsă a ipotezei de race-condition la boot):** Pachetul `babenkoivan/elastic-scout-driver` **nu citește** `ELASTICSEARCH_HOST`/`ELASTICSEARCH_PORT`. El citește o singură variabilă, `ELASTIC_HOST`, în format `host:port` unic, cu fallback la `localhost:9200`. Această variabilă nu era setată deloc — deci clientul cădea mereu pe `localhost:9200`, care în container înseamnă „el însuși", nu serviciul `elasticsearch`.

**Fix:** Adăugat `ELASTIC_HOST=elasticsearch:9200` explicit în `.env` și în `environment:` la `laravel_app`/`laravel_worker`.

**Lecție:** Verificarea numelui exact al variabilei de config trebuie făcută direct în sursa pachetului (`vendor/<pachet>/config/*.php`), nu presupusă din convenția „standard" `ELASTICSEARCH_HOST`.

---

## 4. Healthcheck fals-negativ pe `laravel_worker` și `laravel_scheduler`

**Simptom:** `docker compose ps` arăta ambele servicii ca `(unhealthy)`, deși procesele funcționau corect.

**Cauză:** Ambele servicii moșteneau `HEALTHCHECK` din imaginea Docker (`curl -f http://localhost:8000/`), definit pentru `laravel_app`. Nici worker-ul, nici scheduler-ul nu servesc HTTP — comanda curl eșua mereu.

**Fix:** `healthcheck: disable: true` explicit pentru ambele servicii în `docker-compose.yml`.

---

## 5. `laravel_scheduler` conectat la baza de date greșită

**Simptom:** Nedescoperit direct ca eroare vizibilă, dar identificat prin inspecția configului — risc de coruperi silențioase.

**Cauză:** Serviciul `laravel_scheduler` avea `container_name: shopcore_scheduler` și variabile `DB_DATABASE=shopcore`, `DB_USERNAME=shopcore`, `APP_NAME=Shopcore` — rămășițe copy-paste dintr-un alt proiect. Baza `shopcore` nu exista în instanța MySQL a acestui proiect.

**Fix:** Aliniat complet cu restul serviciilor: `container_name: news_aggregator_scheduler`, `DB_DATABASE=news_aggregator`, `DB_USERNAME=news_aggregator`, `APP_NAME=Laravel`.

---

## 6. OpenAI API Key lipsă

**Simptom:** `OpenAI API RAW ERROR: The OpenAI API Key is missing` la fiecare rulare de `ClassifyArticlesAI`.

**Cauză:** `OPENAI_API_KEY` nu exista deloc în `.env`.

**Fix:** Adăugată cheia reală (`sk-...`) în `.env`. (S-a evaluat și varianta Groq ca alternativă compatibilă OpenAI-API, dar s-a decis păstrarea OpenAI.)

**Efect secundar observat, nu o eroare:** După adăugarea cheii, a apărut temporar `Request rate limit has been exceeded` — semn că autentificarea funcționează, doar volumul de cereri simultane (batch de 10 articole) depășea limita de rate a contului. Nu a necesitat fix suplimentar în această sesiune.

---

## 7. Frontend conectat cu cheie Pusher veche

**Simptom:** Consola browser arăta `❌ Pusher Error: WebSocketError`, iar toate abonările eșuau.

**Cauză:** `frontend/.env` conținea `VITE_PUSHER_APP_KEY=45879cb0d9cad8bd459c` — valoare veche, neactualizată separat de restul serviciilor.

**Fix:** Actualizat `frontend/.env` cu aceeași cheie folosită de backend/Soketi (`news_aggregator_key`), urmat de `docker compose up -d --force-recreate frontend` (Vite citește `.env` doar la boot).

---

## 8. WebSocket încerca `wss://` pe server fără TLS

**Simptom:** După fix-ul #7, consola arăta `Firefox nu poate stabili o conexiune cu serverul wss://localhost:6001/...`.

**Cauză:** `echo.ts` avea `enabledTransports: ["ws", "wss"]`. Cu `wsPort` și `wssPort` setate la aceeași valoare (6001), `pusher-js` încerca uneori `wss` — dar Soketi local rulează HTTP simplu, fără certificat.

**Fix:** `enabledTransports: ["ws"]` — eliminat complet `"wss"` din listă.

---

## 9. Config drift Pusher — runda 2, 3 și 4 (persistent)

**Simptom:** Chiar și după fix-urile #2, #7, #8, eroarea `auth_key should be a valid app key` a revenit de mai multe ori, în valuri, cu combinații diferite de chei coexistând între `laravel_worker`, `soketi` și `frontend`.

**Cauză principală identificată prin logurile Soketi:** La un moment dat, `docker-compose.yml` a fost editat astfel încât Soketi primea chei fără underscore (`newsaggregatorkey123`), în timp ce `laravel_worker` și `frontend` rămâneau pe `news_aggregator_key` (cu underscore) — modificare parțial aplicată, nesincronizată pe toate serviciile deodată.

**Diagnostic fals urmărit temporar:** S-a suspectat că biblioteca client Pusher validează formatul cheii și respinge underscore-urile printr-un regex intern. Investigația în sursa `PusherBroadcaster.php` a arătat că excepția vine dintr-un `catch (ApiErrorException)` — deci mesajul e generat de server (Soketi sau Pusher.com), nu de o validare locală de format. Această ipoteză a fost abandonată.

**Fix aplicat:** Toate cele trei surse (`soketi`, `laravel_app`+`laravel_worker`, `frontend`) sincronizate manual, verificate simultan cu comenzi `printenv`, la aceleași valori: `news_aggregator` / `news_aggregator_key` / `news_aggregator_secret`.

**Verificare:** Confirmat prin logurile Soketi — toate cele 11 canale (`private-category.1` până la `.15`) au trecut `pusher_internal:subscription_succeeded`, fără nicio eroare.

---

## 10. Cauza reală și finală a erorii `auth_key should be a valid app key` la broadcast

**Simptom:** Chiar și cu toate cheile perfect sincronizate (confirmat prin loguri Soketi și `printenv`), joburile `ArticleCreated` din Horizon continuau să eșueze cu exact aceeași eroare, în mod repetat — inclusiv după `horizon:terminate`, restart complet de containere, și verificare de proces unic (fără workeri duplicați).

**Diagnostic:** Test izolat prin `dispatchSync()` (proces PHP nou, sincron) a rulat fără eroare — dar joburile reale, procesate de Horizon din coadă, tot eșuau. Diferența a condus la inspecția `config/broadcasting.php`:

```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'useTLS' => true,
    ],
],
```

**Cauza reală:** Array-ul `options` nu conținea `host`, `port` sau `scheme`. Fără aceste chei, biblioteca client `pusher-php-server`, folosită de Laravel pentru a **trimite efectiv** evenimente (`trigger()`), nu avea nicio informație despre Soketi local — cădea pe default-ul intern al pachetului: serverul cloud real, `api-mt1.pusher.com`. Acolo, `news_aggregator_key` (cheie inventată local) evident „nu exista ca aplicație validă".

Asta explica de ce simptomele erau atât de contradictorii de-a lungul întregii sesiuni:
- **Autorizarea canalelor** (`/broadcasting/auth`) funcționa mereu corect — e cod Laravel propriu (HMAC manual), nu atinge deloc SDK-ul client Pusher.
- **Conexiunea WebSocket a frontend-ului** funcționa mereu corect — `pusher-js` din `echo.ts` avea `wsHost`/`wsPort` setate explicit, deci se conecta direct la Soketi.
- **Doar trimiterea efectivă a evenimentelor** (`ArticleCreated`, prin `PusherBroadcaster->broadcast()`) eșua — pentru că era singurul punct din tot fluxul unde clientul PHP nu avea un `host` custom configurat.

**Fix definitiv:**
```php
'options' => [
    'host' => env('PUSHER_HOST'),
    'port' => env('PUSHER_PORT', 443),
    'scheme' => env('PUSHER_SCHEME', 'https'),
    'cluster' => env('PUSHER_APP_CLUSTER'),
    'useTLS' => env('PUSHER_SCHEME', 'https') === 'https',
    'encrypted' => true,
],
```

**Verificare finală:** `ArticleCreated` a rulat `Completed` în Horizon (nu `Failed`), iar consola browser a afișat `🔥 New article received`, confirmând recepția live a evenimentului prin WebSocket.

---

## Lecții generale pentru evitarea acestor probleme pe viitor

1. **O singură sursă de adevăr pentru variabilele partajate.** Cheile Pusher/Soketi trebuie definite o singură dată (ex. într-un fișier `.env` comun montat în toate containerele) în loc de duplicate manual în `environment:` la fiecare serviciu — orice duplicare creează risc de drift la fiecare schimbare.

2. **`docker compose restart` nu garantează config proaspăt.** Pentru schimbări de `.env` sau `docker-compose.yml`, folosiți `docker compose up -d --force-recreate <serviciu>` — `restart` doar repornește procesul din containerul existent, cu env-ul deja capturat la creare.

3. **Procesele Horizon long-running pot ține config vechi în memorie.** După orice schimbare relevantă pentru worker, rulați `php artisan horizon:terminate` (supervisorul repornește automat workerii, citind env-ul curent) sau recreați complet containerul.

4. **Nu presupuneți numele variabilelor de config pentru pachete third-party.** Verificați direct în `vendor/<pachet>/config/*.php` — convențiile variază între pachete (`ELASTIC_HOST` vs `ELASTICSEARCH_HOST`, de exemplu).

5. **O eroare „auth" poate avea surse complet diferite la fiecare strat.** În acest proiect, trei straturi distincte (autorizare canal, conexiune WebSocket, trimitere efectivă eveniment) foloseau căi de cod diferite pentru a ajunge la Soketi — fiecare cu propriul potențial de configurare greșită, independent de celelalte.

6. **Testați izolat, la nivelul corect.** `dispatchSync()` într-un proces tinker nou testează configul „la boot", dar nu reflectă neapărat ce vede un worker Horizon deja pornit. Pentru teste realiste ale unui bug de coadă, treceți prin coadă reală (`dispatch()`, nu `dispatchSync()`) și verificați rezultatul în Horizon, nu doar output-ul terminalului.