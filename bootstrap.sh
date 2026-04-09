#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
until npm run db:migrate; do
  echo "Database is not ready yet. Retrying in 2 seconds..."
  sleep 2
done

echo "Database schema pushed successfully."

# Run seeding
echo "Running database seeding..."
if npm run db:seed; then
  echo "Seeding completed successfully."
else
  echo "Seeding failed or script not found. Skipping seeding."
fi

# Start the application
echo "Starting application..."
exec npm run start:prod -- --port 3000 --hostname 0.0.0.0
