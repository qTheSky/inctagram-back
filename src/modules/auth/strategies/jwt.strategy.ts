import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessPayload } from '../interfaces/jwt.payloads';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // we get into this method 100%
  async validate(payload: AccessPayload) {
    // we can make request to DB and get necessary information about user
    // but it is a bad practice
    return { id: payload.userId }; //=> good practice return only user id
    // return { userId: payload.sub, username: payload.username };
  }
}
