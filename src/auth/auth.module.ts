import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  controllers: [AuthController],
  providers: [UserService, LocalStrategy, SessionSerializer]
})
export class AuthModule {}
