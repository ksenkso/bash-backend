import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private users: Repository<User>
  ) {
  }

  async create(payload: CreateUserDto) {
    // I'm not gonna encrypt passwords here.
    // Not because I can't.
    // But because I don't want to.
    const user = this.users.create(payload);

    return this.users.save(user);
  }

  validateUser(username: string, password: string) {
    return this.users.findOneBy({ username, password });
  }
}
