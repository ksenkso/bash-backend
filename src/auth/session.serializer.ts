import { PassportSerializer } from '@nestjs/passport';
import { SessionStoredUser, User } from '../entity/user.entity';
import { UsersService } from '../slices/users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async deserializeUser(payload: SessionStoredUser, done: Function) {
    const user = await this.usersService.findOne(payload.username);

    if (user) {
      done(null, user);
    } else {
      done(null, null);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  serializeUser(user: User, done: Function) {
    done(null, user.withoutPassword());
  }
}
