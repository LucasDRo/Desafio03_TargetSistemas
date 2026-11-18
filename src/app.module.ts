import { Module } from '@nestjs/common';
import { JurosModule } from './juros/juros.module';

@Module({
  imports: [JurosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
