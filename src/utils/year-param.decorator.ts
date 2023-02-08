import { Param, PipeTransform } from '@nestjs/common';
import { QuoteYear } from '../quote/quote.service';

class YearValidator implements PipeTransform<string, QuoteYear> {
  transform(value: string) {
    if (value === 'first' || value === 'last') {
      return value;
    }

    const parsed = +value;

    if (!isNaN(parsed)) {
      return parsed;
    }

    return 'first';
  }
}

export const YearParam = () => Param('year', new YearValidator());
