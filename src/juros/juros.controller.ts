import { Body, Controller, Post } from '@nestjs/common';
import { CalculoJurosDTO } from './dtos/calculo-juros.dto';
import { JurosService } from './juros.service';

@Controller('juros')
export class JurosController {
  constructor(private readonly jurosService: JurosService) { }

  @Post('calcular')
  calcular(@Body() dados: CalculoJurosDTO) {
    return this.jurosService.calcular(dados);
  }
}
