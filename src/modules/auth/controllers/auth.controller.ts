import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../../../../common/dto/auth.dto';
import { BaseController } from '../../../../common/base-components/base.controller';
import { UserEntity } from '../../../../entities/user.entity';
import { CustomHttpResponse } from '../../../../common/interfaces/http.response';

@Controller('auth')
export class AuthController extends BaseController<UserEntity> {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('/register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<CustomHttpResponse> {
    this.response = new CustomHttpResponse();

    if (registerDto.password != registerDto.confirmPassword) {
      throw new BadRequestException("Passwords doesn't match!");
    }

    try {
      await this.authService.register(registerDto);
      this.response.success = true;
      return this.response;
    } catch (e) {
      this.response.errors.push(e.message);
      throw new BadRequestException(this.response);
    }
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    this.response = new CustomHttpResponse();

    try {
      const loginResponse = await this.authService.login(loginDto);
      this.response.success = true;
      return {
        ...this.response,
        ...loginResponse,
      };
    } catch (e) {
      this.response.errors.push(e.message);
      throw new BadRequestException(this.response);
    }
  }
}
