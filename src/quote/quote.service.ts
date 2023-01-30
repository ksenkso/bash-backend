import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { Repository } from 'typeorm';
import { QuoteImportDto } from './dto/quote-import.dto';
import { pagination } from '../utils/pagination';
import { Vote } from './vote.enum';

export type OrderField = 'rating' | 'id' | 'date';
export type OrderDirection = 'asc' | 'desc';
export type Order = {
  field: OrderField;
  dir: OrderDirection;
};

const defaultOrder: Order = {
  field: 'id',
  dir: 'asc',
};

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

  getPage(page: number, order = defaultOrder) {
    if (page < 1) {
      throw new BadRequestException('Page should be greater than 1.');
    }

    const mergedOrder =
      order === defaultOrder ? order : { ...defaultOrder, ...order };

    const listQuery = this.quotesRepository.find({
      skip: QuoteService.PER_PAGE * (page - 1),
      take: QuoteService.PER_PAGE,
      order: {
        [mergedOrder.field]: mergedOrder.dir,
      },
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

  async vote(id: number, vote: Vote) {
    const quote = await this.quotesRepository.findOne({ where: { id } });
    quote.rating = vote === Vote.UP ? quote.rating + 1 : quote.rating - 1;

    return this.quotesRepository.save(quote);
  }
}
