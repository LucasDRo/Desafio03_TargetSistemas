# Desafio 3 — Cálculo de juros por atraso

API em TypeScript com NestJS que recebe um valor e uma data de vencimento e calcula os juros até a data atual, considerando a taxa de **2,5% ao dia** informada no enunciado.

## Regra de cálculo

Como o enunciado não especifica capitalização, a implementação considera juros simples:

```text
juros = valor × 0,025 × dias de atraso
valor total = valor + juros
```

- O dia do vencimento não gera juros. A contagem começa no dia seguinte.
- Vencimentos futuros retornam juros e dias de atraso iguais a zero.
- Todos os dias de calendário são considerados, inclusive fins de semana e feriados.
- A data de hoje é obtida automaticamente no fuso `America/Sao_Paulo`.
- O valor informado é arredondado para centavos antes do cálculo. Os juros são arredondados para centavos no final, antes da soma do total.
- O valor deve ser um número finito, não negativo e dentro do limite de cálculo seguro. Zero é aceito.
- A data deve existir no calendário e estar no formato `AAAA-MM-DD`.

## Como executar

Com Node.js 22 ou superior e npm instalados, no diretório `desafio3` execute:

```bash
npm ci
npm run start:dev
```

A API fica disponível em `http://localhost:3000`. A porta pode ser alterada pela variável de ambiente `PORT`. Não é necessário configurar banco de dados ou arquivo `.env`.

Para compilar e executar o código compilado:

```bash
npm run build
npm run start:prod
```

## Endpoint

```http
POST /juros/calcular
Content-Type: application/json
```

Requisição:

```json
{
  "valor": 100,
  "dataVencimento": "2026-11-08"
}
```

Exemplo de resposta HTTP `201 Created`, **considerando que a data de hoje seja 18/11/2026**:

```json
{
  "valor": 100,
  "dataVencimento": "2026-11-08",
  "dataCalculo": "2026-11-18",
  "diasAtraso": 10,
  "taxaDiaria": 0.025,
  "juros": 25,
  "valorTotal": 125
}
```

A data e os resultados mudam conforme o dia da execução. O campo `taxaDiaria` representa a taxa decimal: `0.025` equivale a `2,5%`.

Entradas inválidas retornam HTTP `400 Bad Request`, com uma mensagem indicando o problema.

## Estrutura

```text
src/
├── main.ts
├── app.module.ts
└── juros/
    ├── juros.module.ts
    ├── juros.controller.ts
    ├── juros.service.ts
    └── dtos/
        └── calculo-juros.dto.ts
```

O controller recebe os dados e o service valida os campos e calcula os juros. O processamento não persiste dados.

## Verificação

```bash
npm run build
npm run lint
npm run test:e2e -- --runInBand
```

Os testes verificam o cálculo de juros simples, vencimentos no presente e no futuro, arredondamento, a data de São Paulo na virada do dia em UTC e entradas inválidas. O relógio é fixado durante os testes para que os resultados não dependam do dia da execução.
