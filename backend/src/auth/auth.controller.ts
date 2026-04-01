import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDTO) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (user instanceof UnauthorizedException) {
      throw user;
    }
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return await this.authService.login({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const payload = this.authService.verifyToken(refreshToken);
    if (payload instanceof UnauthorizedException) {
      throw payload;
    }
    const user = await this.authService.findUserById(payload.sub);

    if (user instanceof UnauthorizedException) {
      throw user;
    }
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.login({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
