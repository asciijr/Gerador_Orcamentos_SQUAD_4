import { defineConfig } from 'prisma/config';

// DATABASE_URL vem do .env (via Docker Compose). O generate não precisa dela;
// migrate e seed sim, e por isso rodam dentro do container.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
