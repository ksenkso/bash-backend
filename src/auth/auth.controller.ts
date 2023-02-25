import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { SessionGuard } from './session.guard';
import { LocalGuard } from './local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: UserService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async login(@Req() req: Request) {
    return req.user;
  }

  @Post()
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @UseGuards(SessionGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
