#!/bin/bash

# Build the React frontend
echo "Building React frontend..."
cd frontend
npm install
npm run build

# Go to backend directory
cd ../backend

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Apply database migrations
# echo "Applying database migrations..."
# python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build complete!"