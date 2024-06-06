import { Module } from '@nestjs/common';
import { AuthService, RolesService } from './services';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EncriptarPassAdapter } from './adapters/encriptar-pass.adapter';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, JwtStrategy, EncriptarPassAdapter],
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: envs.secretKey,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports: [PassportModule, RolesService, AuthService, EncriptarPassAdapter, JwtModule],
})
export class AuthModule {}
