import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces';
import { AuthService } from '../services/auth.service';
import { envs } from 'src/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      secretOrKey: envs.secretKey,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;

    const user = await this.authService.validateUserById(id);

    if (!user) throw new UnauthorizedException('Token not Valid');

    return user;

    // const user = await this.userRepository.findOneBy({ id });

    // if (!user) throw new UnauthorizedException('Token not Valid');

    // if (!user.isActive)
    //   throw new UnauthorizedException('User is inactive, talk with an admin');

    // return user;
  }
}
