import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

interface SessionStoredUser {
  username: string;
}

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private userService: UserService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async deserializeUser(payload: SessionStoredUser, done: Function) {
    const user = await this.userService.findOne(payload.username);

    if (user) {
      done(null, user.withoutPassword());
    } else {
      done(null, null);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  serializeUser(user: User, done: Function) {
    done(null, user);
  }
}
