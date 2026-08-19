# AI News Aggregator & Intelligence Platform

Platformă automatizată de știri, de înaltă performanță, care ingerează știri globale din surse multiple, folosește AI pentru clasificare inteligentă și analiză de sentiment, și livrează o experiență de știri personalizată, în timp real, la scară.

## Descriere

O platformă automatizată de știri care ingerează articole din surse multiple (RSS și API), le clasifică folosind inteligență artificială, calculează un scor de relevanță, și le livrează utilizatorilor abonați în timp real, prin WebSocket, fără a fi nevoie de refresh.

## Flux de procesare

1. **Ingestion (Ingerare)**
   `FetchNewsJob` rulează periodic (la fiecare 5 minute, via `laravel_scheduler`) și preia cele mai recente articole din toate sursele RSS și API configurate.

2. **Processing (Procesare)**
   `ProcessArticlesBatchJob` curăță conținutul, elimină duplicatele (hash pe titlu + URL), și validează structura fiecărui articol înainte de salvare.

3. **Classification (Clasificare)**
   Articolele sunt etichetate automat printr-o potrivire de cuvinte-cheie pe categoriile existente. Articolele care nu găsesc o potrivire clară sunt marcate `needs_ai=true` și trecute prin `ClassifyArticlesAI`, care folosește OpenAI API pentru clasificare semantică.

4. **Storage (Stocare)**
   Datele relaționale (utilizatori, categorii, surse, abonamente) sunt salvate în MySQL. Conținutul integral al articolelor, inclusiv payload-ul brut original, e salvat în MongoDB.

5. **Broadcasting (Difuzare)**
   La salvarea cu succes a unui articol nou, evenimentul `ArticleCreated` declanșează o notificare în timp real către utilizatorii abonați la categoria respectivă, via Soketi (server WebSocket compatibil Pusher, rulat local).

6. **Delivery (Livrare)**
   Utilizatorii primesc actualizări instant în feed-ul lor personalizat, fără să fie nevoie de refresh — conexiunea WebSocket rămâne deschisă și livrează evenimentul direct în interfață.

## Comenzi utile

**Declanșare manuală a fluxului de ingestie:**
```bash
docker compose exec laravel_worker php artisan tinker --execute="App\Jobs\FetchNewsJob::dispatch();"
```

**Monitorizare cozi (Horizon):**
```
http://127.0.0.1:8000/horizon
```

**Verificare stare completă a platformei:**
```bash
docker compose ps
docker compose logs -f laravel_worker
```

Pentru detalii tehnice complete despre arhitectură, modele și configurare, vezi `README.md`. Pentru istoricul problemelor de infrastructură întâlnite și rezolvate, vezi `POSTMORTEM.md`.