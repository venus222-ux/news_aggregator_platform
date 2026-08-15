<?php

return [
    'namespace' => env('PROMETHEUS_NAMESPACE', 'laravel'),

    'redis' => [
        'host' => env('REDIS_HOST', 'news_aggregator_redis'),
        'port' => (int) env('REDIS_PORT', 6379),
        'timeout' => 1.0,
        'read_timeout' => '10',
        'persistent_connections' => false,
        'database' => (int) env('REDIS_METRICS_DB', 2),
    ],
];