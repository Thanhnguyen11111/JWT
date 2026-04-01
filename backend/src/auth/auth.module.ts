import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    JwtModule.register({
        secret: process.env.JWT_SECRET || 'defaultSecretKey',
        signOptions: {expiresIn: '1h'}
    }),
    PrismaModule], // 👈 thêm dòng này
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
