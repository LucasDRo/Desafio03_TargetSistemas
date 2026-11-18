import { BadRequestException, Injectable } from '@nestjs/common';
import { CalculoJurosDTO } from './dtos/calculo-juros.dto';

@Injectable()
export class JurosService {

  calcular(dados: CalculoJurosDTO) {

    const vencimento = this.validarDto(dados);

    const dataCalculo = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Sao_Paulo',
    });
    const hoje = new Date(`${dataCalculo}T00:00:00Z`);
    const diasAtraso = Math.max(
      0,
      (hoje.getTime() - vencimento.getTime()) / 86_400_000,
    );

    const valor = Math.round((dados.valor + Number.EPSILON) * 100) / 100;
    const juros = Math.round(valor * 0.025 * diasAtraso * 100) / 100;
    const valorTotal = Math.round((valor + juros) * 100) / 100;

    if (!Number.isSafeInteger(Math.round(valorTotal * 100))) {
      throw new BadRequestException('Valor excede o limite de cálculo');
    }

    return {
      valor,
      dataVencimento: dados.dataVencimento,
      dataCalculo,
      diasAtraso,
      taxaDiaria: 0.025,
      juros,
      valorTotal,
    };
  }

  validarDto(dados: CalculoJurosDTO) {
    if (!Number.isFinite(dados?.valor) || dados.valor < 0) {
      throw new BadRequestException('Valor deve ser um número não negativo');
    }

    if (
      typeof dados.dataVencimento !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dados.dataVencimento)
    ) {
      throw new BadRequestException(
        'Data de vencimento deve estar no formato AAAA-MM-DD',
      );
    }

    const vencimento = new Date(`${dados.dataVencimento}T00:00:00Z`);
    if (
      isNaN(vencimento.getTime()) ||
      vencimento.toISOString().slice(0, 10) !== dados.dataVencimento
    ) {
      throw new BadRequestException('Data de vencimento inválida');
    }

    return vencimento;
  }
}
