import { Body, Controller, Post, UseGuards, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SessionGuard } from './session.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: UserService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
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
