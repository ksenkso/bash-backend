import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest() as Request;

    return !!req.user;
  }
}
