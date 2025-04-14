# Use a multi-stage build to optimize the image size

# Stage 1: Build the React frontend
FROM node:18 as frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Stage 2: Build the Django backend
FROM python:3.9-slim as backend-builder
WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend ./

# Copy the built React frontend to the Django static files directory
COPY --from=frontend-builder /app/frontend/dist ./frontend_build

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port Gunicorn will run on
EXPOSE 8000

# Start the Gunicorn server
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]