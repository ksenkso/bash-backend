import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private users: Repository<User>
  ) {
  }

  async create({ username, password }: CreateUserDto) {
    const payload = {
      username,
      password: await this.hashPassword(password),
    };
    const user = this.users.create(payload);

    return this.users.save(user);
  }

  async findOne(username: string) {
    return this.users.findOneBy({ username });
  }

  async validateUser(username: string, password: string) {
    const user = await this.users.findOneBy({ username });

    if (!user) {
      throw new NotFoundException();
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new ForbiddenException();
    }

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);

    return bcrypt.hash(password, salt);
  }
}
