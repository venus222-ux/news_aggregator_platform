AI News Aggregator & Intelligence Platform
A high-performance, automated news intelligence platform that ingests, classifies, and serves global news at scale. This project leverages a hybrid database architecture and AI-driven classification to provide a personalized, real-time news experience.

1. Product Vision
   The goal of this project is to build a professional-grade news engine that supports:

Automated Ingestion: Seamlessly pulling from RSS feeds and REST APIs.

AI Intelligence: Automated categorization and sentiment analysis using LLMs.

High Performance: Hybrid storage (MySQL + MongoDB) to balance relationships and data volume.

Real-Time Delivery: Instant notifications and live feed updates.

Elastic Search: Sub-second full-text search across thousands of articles.

2. Tech Architecture
   Backend (Laravel 12)
   The backend follows a service-oriented, API-first architecture designed for background processing.

API Layer: RESTful API with JWT Authentication.

MySQL: Relational data (Users, Sources, Categories, Subscriptions, Permissions).

MongoDB: High-volume article storage and raw metadata.

Redis: High-speed caching and job queue management.

Elasticsearch: Powerful full-text search and filtering.

Pusher: Real-time event broadcasting for live updates.

Spatie Roles: Advanced Role-Based Access Control (RBAC).

Frontend (React + Vite + TypeScript)
A modern SPA built for speed and reactive user interactions.

State Management: Zustand for lightweight, global state.

Data Fetching: TanStack Query (React Query) for smart caching.

Real-Time: Laravel Echo integration with Pusher.

UI/UX: Responsive design with Infinite Scroll for seamless reading.

3. Core Features
   Data Ingestion
   Multi-Source Fetching: Supports RSS (XML/Atom) and RESTful JSON APIs.

Background Processing: Uses Laravel Queues to handle fetching without blocking the UI.

Smart De-duplication: Title and URL hashing to prevent duplicate articles.

AI & Classification
Automated Tagging: AI-driven categorization based on content analysis.

Background Job Retry: Smart handling of AI rate limits and API failures.

User Experience
Category Subscriptions: Users follow specific topics (Tech, World, Sports).

Infinite Scroll: Never-ending feed optimized for engagement.

Live Notifications: Real-time alerts via Pusher when breaking news hits.

Search & Discovery
Advanced Search: Full-text search powered by Elasticsearch.

Personalized Feed: Algorithms prioritize articles based on user subscriptions.

4. Operational Flow
1. Ingestion Pipeline
   The Scheduler triggers FetchNewsJob every 5 minutes. This job reaches out to external APIs and RSS feeds.

1. Processing & Normalization
   Articles are passed to ProcessArticlesBatchJob where they are:

Validated and cleaned.

Checked against MongoDB for existing hashes.

Assigned to categories via keyword matching or AI classification.

3. Storage Strategy
   MySQL handles the "Who" (Users, Permissions, Sources).

MongoDB handles the "What" (The massive volume of Articles and their raw JSON metadata).

4. Real-Time Sync
   New articles trigger a Pusher Event, alerting connected clients that fresh content is available in their feed.

5. Architecture Philosophy
   Asynchronous-First: All heavy lifting (API calls, AI, MongoDB writes) happens in background queues.

Scalability: The separation of MySQL and MongoDB allows the platform to handle millions of articles.

Hybrid Storage: Uses the best tool for the job—relational for logic, document-based for content.

RSS Fetch Job
↓
ProcessArticleJob
↓
Article::create()
↓
event(new ArticleCreated($article))
↓
Pusher
↓
Echo (Navbar)
