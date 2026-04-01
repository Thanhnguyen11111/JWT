import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { LoginUserDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(RegisterDto: RegisterDto) {
    const { email, password, name } = RegisterDto;
    // Check if user already exists

    const existingUSer = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUSer) {
      throw new BadRequestException('User already exists with this email');
    }

    // has pw hasshing logic here if needed

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
        name,
      },
    });
    const { password: _, ...result } = user;
    return result;
  }
  async validateUser(email: string, password: string){
    const user = await this.prisma.user.findUnique({
        where: {email}
    })

    if(!user) {
        return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
         return null
    }
    const {password: _, ... result} = user
    return result
  }
  async login(user: { id: string; email: string, role: string}) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload,{
        expiresIn: '1h'
    })
    const refreshToken = this.jwtService.sign(payload,{
        expiresIn: '7d'
    })
    return {
        accessToken,
        refreshToken,
    }
  }
  verifyToken(token: string){
    try {
      return this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'defaultSecretKey'})
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
  findUserById(id: string){
    return this.prisma.user.findUnique({
      where: {id}
    })
  }
}
