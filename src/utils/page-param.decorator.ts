import { DefaultValuePipe, Param } from '@nestjs/common';

export const PageParam = () => Param('page', new DefaultValuePipe(1));
