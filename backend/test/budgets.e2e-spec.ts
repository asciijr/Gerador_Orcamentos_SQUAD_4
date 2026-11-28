import {
  INestApplication,
  Injectable,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { BudgetsModule } from '../src/modules/budgets/budgets.module';
import { BudgetsService } from '../src/modules/budgets/budgets.service';

@Injectable()
class BudgetsConsumer {
  constructor(readonly budgetsService: BudgetsService) {}
}

@Module({
  imports: [BudgetsModule],
  providers: [BudgetsConsumer],
})
class ConsumerModule {}

const validPayload = {
  client: 'Acme',
  project: 'Portal',
  hours: '160',
  hourlyRate: '125.00',
  extraExpenses: '4500.00',
  marginPercent: '20',
};

describe('Budgets (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('exporta BudgetsService como interface pública do BudgetsModule', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConsumerModule],
    }).compile();

    const consumer = moduleRef.get(BudgetsConsumer);
    expect(consumer.budgetsService).toBeInstanceOf(BudgetsService);
  });

  it('POST /api/budgets/calculate responde 200 com as 5 parcelas em texto com 2 casas', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/budgets/calculate')
      .send(validPayload)
      .expect(200);

    expect(res.body).toEqual({
      laborCost: '20000.00',
      extraExpenses: '4500.00',
      totalCost: '24500.00',
      marginValue: '4900.00',
      finalPrice: '29400.00',
    });
  });

  it('POST /api/budgets/calculate aceita números e despesas/margem zeradas', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/budgets/calculate')
      .send({
        client: 'Cliente Teste',
        project: 'Projeto Teste',
        hours: 10,
        hourlyRate: 50,
        extraExpenses: 0,
        marginPercent: 0,
      })
      .expect(200);

    expect(res.body).toEqual({
      laborCost: '500.00',
      extraExpenses: '0.00',
      totalCost: '500.00',
      marginValue: '0.00',
      finalPrice: '500.00',
    });
  });

  it.each([
    ['hours', { ...validPayload, hours: 0 }],
    ['hourlyRate', { ...validPayload, hourlyRate: '10.123' }],
    ['extraExpenses', { ...validPayload, extraExpenses: '-0.01' }],
    ['marginPercent', { ...validPayload, marginPercent: 'abc' }],
    ['marginPercent', { ...validPayload, marginPercent: [10] }],
  ])(
    'POST /api/budgets/calculate responde 400 indicando o campo numérico inválido (%s)',
    async (expectedField, payload) => {
      const res = await request(app.getHttpServer())
        .post('/api/budgets/calculate')
        .send(payload)
        .expect(400);

      const body = res.body as {
        statusCode: number;
        field: string;
        message: string;
      };

      expect(body.statusCode).toBe(400);
      expect(body.field).toBe(expectedField);
      expect(typeof body.message).toBe('string');
      expect(body.message.length).toBeGreaterThan(0);
    },
  );

  it.each([
    ['cliente', { ...validPayload, client: '' }],
    [
      'projeto',
      {
        client: 'Acme',
        hours: '10',
        hourlyRate: '50',
        extraExpenses: '0',
        marginPercent: '0',
      },
    ],
    ['unknownField', { ...validPayload, unknownField: 'extra' }],
  ])(
    'POST /api/budgets/calculate responde 400 na validação do DTO (%s)',
    async (expectedText, payload) => {
      const res = await request(app.getHttpServer())
        .post('/api/budgets/calculate')
        .send(payload)
        .expect(400);

      const body = res.body as {
        statusCode: number;
        message: string[];
      };

      expect(body.statusCode).toBe(400);
      expect(body.message.join(' ')).toContain(expectedText);
    },
  );
});
