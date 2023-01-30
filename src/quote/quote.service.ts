import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { Repository } from 'typeorm';
import { QuoteImportDto } from './dto/quote-import.dto';
import { pagination } from '../utils/pagination';

@Injectable()
export class QuoteService {
  private static PER_PAGE = 25;

  constructor(
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
  ) {}

  async create(createQuoteDto: CreateQuoteDto) {
    const quote = this.quotesRepository.create(createQuoteDto);

    return await this.quotesRepository.save(quote);
  }

  findAll() {
    return this.quotesRepository.find();
  }

  getPage(page: number) {
    if (page < 1) {
      throw new BadRequestException('Page should be greater than 1.');
    }

    const listQuery = this.quotesRepository.find({
      skip: QuoteService.PER_PAGE * (page - 1),
      take: QuoteService.PER_PAGE,
    });
    const totalQuery = this.quotesRepository.count();

    return Promise.all([listQuery, totalQuery]).then(([list, total]) => {
      return {
        list,
        pagination: pagination({
          total,
          page,
          perPage: QuoteService.PER_PAGE,
        }),
      };
    });
  }

  findOne(id: number) {
    return this.quotesRepository.findOneOrFail({ where: { id } });
  }

  update(id: number, updateQuoteDto: UpdateQuoteDto) {
    return `This action updates a #${id} quote`;
  }

  remove(id: number) {
    return `This action removes a #${id} quote`;
  }

  async import(file: Express.Multer.File) {
    const data = JSON.parse(file.buffer.toString()) as QuoteImportDto[];

    for await (const quote of data) {
      const [date, time] = quote.date.split('T');
      const [d, m, y] = date.split('-');
      const dateString = [y, m, d].join('-');

      const [hh, mm] = time.trim().split(':');
      const timeString = [hh.padStart(2, '0'), mm.padStart(2, '0')].join(':');

      const timestamp = [dateString, timeString].join('T');
      (quote.date as any) = new Date(timestamp);
      quote.rating = quote.rating || 0;
      console.log(quote.id);
      await this.quotesRepository.insert(quote);
    }

    return true;
  }
}
