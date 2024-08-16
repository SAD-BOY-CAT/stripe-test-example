import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async singIn(email: string, pass: string) {
    const user = await this.userService.getUser(email);
    console.log(pass);
    //if (user. !== pass) throw new UnauthorizedException();

    const payload = { sub: user.id, email: user.email };
    return {
      accees_token: await this.jwtService.signAsync(payload),
    };
  }
}
