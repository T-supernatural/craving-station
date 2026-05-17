# Craving Station Bakery Backend

This folder contains the initial Django REST Framework backend scaffold for the Craving Station bakery and catering platform.

## Goals

- Provide a clean backend project structure for gradual migration from Supabase.
- Include JWT authentication, PostgreSQL configuration, CORS settings, and Cloudinary integration.
- Support products, orders, bookings, gallery, and payment models.

## Setup

1. Create a Python virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and update values.
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
