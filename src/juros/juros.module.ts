import { Module } from '@nestjs/common';
import { JurosController } from './juros.controller';
import { JurosService } from './juros.service';

@Module({
    controllers: [JurosController],
    providers: [JurosService]
})
export class JurosModule { }
