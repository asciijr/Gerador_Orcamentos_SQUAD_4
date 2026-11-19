/**
 * Popula o banco LOCAL com orçamentos fictícios (Guia de Engenharia 9.6).
 * Uso: docker compose exec backend npm run db:seed
 * Nunca use dados reais de clientes aqui.
 */
import { faker } from '@faker-js/faker/locale/pt_BR';
import { PrismaPg } from '@prisma/adapter-pg';
import Decimal from 'decimal.js';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SEED_SIZE = 10;
const round = (value: Decimal) =>
  value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

// Valores derivados calculados aqui só para os dados fictícios ficarem coerentes.
// O card #4 troca este cálculo pelo calculatePrice do módulo budgets.
function fakeBudget() {
  const hours = new Decimal(faker.number.int({ min: 20, max: 400 }));
  const hourlyRate = new Decimal(faker.number.int({ min: 40, max: 150 }));
  const extraExpenses = new Decimal(faker.number.int({ min: 0, max: 5000 }));
  const marginPercent = new Decimal(faker.number.int({ min: 10, max: 40 }));
  const laborCost = round(hours.times(hourlyRate));
  const totalCost = laborCost.plus(extraExpenses);
  const marginValue = round(totalCost.times(marginPercent).dividedBy(100));

  return {
    clientName: faker.company.name(),
    projectName: `Sistema de ${faker.commerce.department()}`,
    hours: hours.toFixed(2),
    hourlyRate: hourlyRate.toFixed(2),
    extraExpenses: extraExpenses.toFixed(2),
    marginPercent: marginPercent.toFixed(2),
    laborCost: laborCost.toFixed(2),
    totalCost: totalCost.toFixed(2),
    marginValue: marginValue.toFixed(2),
    finalPrice: totalCost.plus(marginValue).toFixed(2),
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
