import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'apps/ensemble-service/users/users.service';
import { CreateUserDto } from 'apps/ensemble-service/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    console.info(`Login attempt by user: ${loginDto.username}`);
    const user = await this.usersService.findOne(loginDto.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    console.info(`Login attempt by user: ${loginDto.username} successful`);
    const payload = { username: loginDto.username, sub: loginDto.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async create(createUserDto: CreateUserDto) {
    console.info(`Create attempt by user: ${createUserDto.username}`);

    const user = await this.usersService.create(createUserDto);

    console.info(
      `Create attempt by user: ${createUserDto.username} successful`,
    );

    const payload = { username: user.username, sub: user._id };

    return { access_token: this.jwtService.sign(payload) };
  }
}
