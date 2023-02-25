import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { QuoteImportDto } from './dto/quote-import.dto';
import { pagination } from '../utils/pagination';
import { Vote } from './vote.enum';

export type OrderField = 'rating' | 'id' | 'date';
export type OrderDirection = 'ASC' | 'DESC';
export type Order = {
  field: OrderField;
  dir: OrderDirection;
};

const defaultOrder: Order = {
  field: 'id',
  dir: 'ASC',
};

interface QueryOptions {
  where?: FindOptionsWhere<Quote> | Array<[string, Record<string, string>]>;
  order?: Record<OrderField, OrderDirection>;
}

export type YearAlias = 'first' | 'last';
export type QuoteYear = number | YearAlias;

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

  search(query: string, page = 1) {
    if (query.length < 3) {
      throw new BadRequestException('Минимум 3 символа, ну камон');
    }

    return this.query(page, {
      where: [['"indexedText" @@ plainto_tsquery(:query)', { query }]],
      ...this.order({ field: 'rating', dir: 'DESC' }),
    });
  }

  getPage(page: number, order = defaultOrder) {
    if (page < 1) {
      throw new BadRequestException('Page should be greater than 1.');
    }

    return this.query(page, this.order(order));
  }

  private query(page: number, options: QueryOptions) {
    const listBuilder = this.quotesRepository.createQueryBuilder();

    if (Array.isArray(options.where) && options.where.length) {
      listBuilder.where(...options.where[0]);
      if (options.where.length > 1) {
        options.where.slice(1).forEach((option) => {
          listBuilder.andWhere(...option);
        });
      }
    } else if (options.where) {
      listBuilder.where(options.where);
    }

    listBuilder
      .skip(QuoteService.PER_PAGE * (page - 1))
      .take(QuoteService.PER_PAGE);

    if (options.order) {
      listBuilder.orderBy(options.order);
    }

    const totalBuilder = listBuilder.clone();

    const listQuery = listBuilder.getMany();
    const totalQuery = totalBuilder.getCount();
    console.log(listBuilder.getQuery());
    console.log(totalBuilder.getQuery());

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

  private order(order = defaultOrder) {
    const mergedOrder =
      order === defaultOrder ? order : { ...defaultOrder, ...order };

    return {
      order: {
        [mergedOrder.field]: mergedOrder.dir,
      } as Record<OrderField, OrderDirection>,
    };
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

  async getRandomQuote(minRating?: number): Promise<Quote> {
    const builder = this.quotesRepository.createQueryBuilder('quote');

    builder
      .limit(1)
      .orderBy('random()');

    if (minRating) {
      builder.where('quote.rating >= :rating', { rating: minRating });
    }

    const quote = await builder.getOne();

    if (!quote) {
      throw new NotFoundException();
    }

    return quote;
  }

  async byYear(year: QuoteYear, page: number, order: Order) {
    const where = await this.buildYearParam(year);
    console.log(where);
    const options: QueryOptions = {
      ...this.order(order),
      where,
    };

    return this.query(page, options);
  }

  private async buildYearParam(year: QuoteYear): Promise<QueryOptions['where']> {
    console.log(year);
    const realYear: number = await this.resolveYear(year);
    console.log(realYear);
    const startDate = new Date(Date.UTC(realYear, 0, 0, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(realYear + 1, 0, 0, 0, 0, 0, 0));

    endDate.setUTCDate(endDate.getUTCDate() - 1);
    console.log(startDate, endDate);

    return {
      date: Between(startDate, endDate),
    };
  }

  private getYearByAlias(yearAlias: YearAlias): Promise<number> {
    const select = yearAlias === 'last'
      ? 'MAX(date) as date'
      : 'MIN(date) as date';

    return this.quotesRepository.createQueryBuilder()
      .select([select])
      .getRawOne<{ date: string }>()
      .then(row => new Date(+row.date).getFullYear());
  }

  private async resolveYear(year: QuoteYear) {
    if (typeof year === 'number') return year;

    return this.getYearByAlias(year);
  }
}
