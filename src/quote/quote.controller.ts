import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { Order, QuoteService, QuoteYear } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Vote } from './vote.enum';
import { PageParam } from '../utils/page-param.decorator';
import { OrderParam } from '../utils/order-param';
import { YearParam } from '../utils/year-param.decorator';

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

  @Get('/search')
  search(@Query('query') query: string) {
    return this.quoteService.search(query);
  }

  @Get('/random')
  randomQuote(@Query('minRating') minRating?: number) {
    return this.quoteService.getRandomQuote(minRating);
  }

  @Get('/page/:page?')
  listById(@PageParam() page: number, @OrderParam() order: Order) {
    return this.quoteService.getPage(page, order);
  }

  @Get('/year/:year/page/:page?')
  yearListById(@YearParam() year: QuoteYear, @PageParam() page: number, @OrderParam() order: Order) {
    return this.quoteService.byYear(year, page, order);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('findOne');
    return this.quoteService.findOne(+id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.quoteService.import(file);
  }
}
