import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'apps/ensemble-service/users/users.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return ({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
        })
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, ConfigService, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
