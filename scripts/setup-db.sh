#!/bin/bash

# Load environment variables
source .env

# echo "Creating PostgreSQL database..."
# psql postgres -c "CREATE DATABASE $DB_NAME;"

echo "Running migrations..."
cd apps/backend
npm run migration:run

echo "Running seeds..."
npm run seed:run

echo "Database setup complete!"
