# Healthcare Platform

This repo now keeps only the active frontend and the new Laravel backend.

## Active Apps

- `apps/web` - Next.js frontend for patient, doctor, and admin flows
- `apps/laravel-api` - Laravel API with PostgreSQL and role-based access control

## Root Scripts

- `npm run dev` - start the web app
- `npm run dev:web` - start the web app directly
- `npm run build:web` - build the web app
- `npm run start:web` - start the web production server

## Backend

Run the Laravel API from its own folder:

```bash
cd apps/laravel-api
php artisan serve --host=127.0.0.1 --port=3001
```

## Notes

- PostgreSQL is the intended database for the backend.
- The old NestJS scaffold and duplicate portal apps were removed to keep the repo focused.
