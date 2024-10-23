import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'apps/ensemble-service/users/dto/create-user.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login(@Body() loginUserDto: LoginDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('auth/create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
}
