import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'apps/ensemble-service/users/users.service';
import { log } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    console.info(`Login attempt by user: ${loginDto.username}`);
    const user = await this.usersService.findOne(loginDto.userId)
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    console.info(`Login attempt by user: ${loginDto.username} successful`);
    const payload = { username: loginDto.username, sub: loginDto.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}