import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { jest } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cálculo de juros (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    await app.init();
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date('2026-11-18T15:00:00Z'));
  });

  afterAll(async () => {
    jest.useRealTimers();
    await app.close();
  });

  it('calcula juros simples de 2,5% ao dia', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/juros/calcular')
      .send({ valor: 100, dataVencimento: '2026-11-08' })
      .expect(201);
    expect(resposta.body).toEqual({
      valor: 100,
      dataVencimento: '2026-11-08',
      dataCalculo: '2026-11-18',
      diasAtraso: 10,
      taxaDiaria: 0.025,
      juros: 25,
      valorTotal: 125,
    });
  });

  it.each(['2026-11-18', '2026-11-19'])(
    'não cobra juros para vencimento em %s',
    async (dataVencimento) => {
      const resposta = await request(app.getHttpServer())
        .post('/juros/calcular')
        .send({ valor: 100, dataVencimento })
        .expect(201);
      expect(resposta.body).toMatchObject({
        diasAtraso: 0,
        juros: 0,
        valorTotal: 100,
      });
    },
  );

  it('arredonda juros para centavos', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/juros/calcular')
      .send({ valor: 19.99, dataVencimento: '2026-11-17' })
      .expect(201);
    expect(resposta.body).toMatchObject({ juros: 0.5, valorTotal: 20.49 });
  });

  it('considera São Paulo na virada do dia em UTC', async () => {
    jest.setSystemTime(new Date('2026-11-19T01:00:00Z'));
    try {
      const resposta = await request(app.getHttpServer())
        .post('/juros/calcular')
        .send({ valor: 100, dataVencimento: '2026-11-18' })
        .expect(201);
      expect(resposta.body).toMatchObject({
        dataCalculo: '2026-11-18',
        juros: 0,
      });
    } finally {
      jest.setSystemTime(new Date('2026-11-18T15:00:00Z'));
    }
  });

  it.each([
    {},
    { valor: -1, dataVencimento: '2026-11-01' },
    { valor: '100', dataVencimento: '2026-11-01' },
    { valor: 100, dataVencimento: '2026-02-30' },
    { valor: 100, dataVencimento: '18/11/2026' },
    { valor: 100, dataVencimento: '18-11-2026' },
    { valor: 100, dataVencimento: null },
    { valor: 1e30, dataVencimento: '2026-11-01' },
  ])('rejeita entrada inválida: %j', async (dados) => {
    await request(app.getHttpServer())
      .post('/juros/calcular')
      .send(dados)
      .expect(400);
  });
});
