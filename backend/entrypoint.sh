#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "✅ Database is ready"

echo "🚀 Running migrations..."
npm run migrate

echo "🌱 Running seed data..."
npm run seed

echo "🟢 Starting backend server..."
npm start