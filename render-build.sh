#!/usr/bin/env bash
# Render Build Script for Laravel Backend
set -e

echo "=== Installing PHP dependencies ==="
composer install --no-dev --optimize-autoloader --no-interaction

echo "=== Generating app key if not set ==="
php artisan key:generate --force

echo "=== Caching config, routes, views ==="
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "=== Running migrations ==="
php artisan migrate --force

echo "=== Creating storage symlink ==="
php artisan storage:link || true

echo "=== Done! ==="
