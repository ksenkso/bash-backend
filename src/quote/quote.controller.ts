import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Vote } from './vote.enum';

@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quoteService.create(createQuoteDto);
  }

  @Patch('/vote/:id/up')
  voteUp(@Param('id') id: number) {
    return this.quoteService.vote(id, Vote.UP);
  }

  @Patch('/vote/:id/down')
  voteDown(@Param('id') id: number) {
    return this.quoteService.vote(id, Vote.DOWN);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quoteService.findOne(+id);
  }

  @Get('/page/:page?')
  getPage(@Param('page') page: number) {
    return this.quoteService.getPage(page || 1);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.quoteService.import(file);
  }
}
