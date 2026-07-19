1. Project Folder
mkdir healthcare-platform
cd healthcare-platform
2. Initialize Monorepo
npm init -y
3. Frontend (Patient Website)
npx create-next-app@latest ./apps/web --use-npm
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

11. Install Validation
npm install class-validator class-transformer

12. Install Swagger
npm install @nestjs/swagger swagger-ui-express


13. Install Queue
npm install bullmq

14. Create First Module
nest g module auth
nest g controller auth
nest g service auth


15. Create Doctor Module
nest g resource doctor

16. Create Patient Module
nest g resource patient

17. Create Appointment Module
nest g resource appointment


18. Create Admin Module
nest g resource admin

19. Run Frontend
cd apps/web

npm run dev

20. Run Backend
cd apps/api

npm run start:dev
