import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const OrderParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const order = request.query.order || 'id';
    const dir = request.query.dir || 'ASC';

    return {
      field: order,
      dir,
    };
  },
);
