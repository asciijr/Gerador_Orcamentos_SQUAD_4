/**
 * Popula o banco LOCAL com orçamentos fictícios (Guia de Engenharia 9.6).
 * Uso: docker compose exec backend npm run db:seed
 * Nunca use dados reais de clientes aqui.
 */
import { faker } from '@faker-js/faker/locale/pt_BR';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import {
  calculatePrice,
  type PricingInput,
} from '../src/modules/budgets/pricing-engine';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SEED_SIZE = 10;

// Entradas fictícias com duas casas, como as colunas DECIMAL da tabela budgets.
const fakeAmount = (min: number, max: number) =>
  faker.number.int({ min, max }).toFixed(2);

// Os valores derivados vêm do mesmo motor de cálculo usado pela API (card #4),
// então o seed acompanha automaticamente qualquer mudança na fórmula.
function fakeBudget() {
  const input = {
    hours: fakeAmount(20, 400),
    hourlyRate: fakeAmount(40, 150),
    extraExpenses: fakeAmount(0, 5000),
    marginPercent: fakeAmount(10, 40),
  } satisfies PricingInput;

  return {
    clientName: faker.company.name(),
    projectName: `Sistema de ${faker.commerce.department()}`,
    ...input,
    ...calculatePrice(input),
    createdAt: faker.date.recent({ days: 60 }),
  };
}

async function main() {
  await prisma.budget.deleteMany();
  await prisma.budget.createMany({
    data: Array.from({ length: SEED_SIZE }, fakeBudget),
  });
  console.log(`[db:seed] ${SEED_SIZE} orçamentos fictícios criados.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
