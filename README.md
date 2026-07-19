1. Project Folder
mkdir healthcare-platform
cd healthcare-platform
2. Initialize Monorepo
npm init -y
3. Frontend (Patient Website)
npx create-next-app@latest apps/web
            ✔ TypeScript → Yes
            ✔ ESLint → Yes
            ✔ Tailwind CSS → Yes
            ✔ App Router → Yes
            ✔ src/ directory → Yes
            ✔ Turbopack → Yes

4.Doctor Dashboard            
npx create-next-app@latest apps/doctor-portal
5.Admin Dashboard
npx create-next-app@latest apps/admin-portal
6.Backend (NestJS)
npm i -g @nestjs/cli

nest new apps/api

7.Install Prisma
cd apps/api

npm install prisma @prisma/client

npx prisma init
8. Install PostgreSQL Driver
npm install pg
9. Install Redis
npm install ioredis
10. Install Authentication
npm install @nestjs/jwt passport passport-jwt bcrypt


