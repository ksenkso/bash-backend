import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService],
  imports: [TypeOrmModule.forFeature([Quote])],
})
export class QuoteModule {}
