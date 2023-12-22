import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto, RegistrationDto } from './authentication.dto';
import { PrismaService } from '../prisma';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthenticationService {
  constructor(private prismaService: PrismaService) {}

  register = async (data: RegistrationDto) => {
    let user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (user) {
      throw new HttpException(
        'Email has been already used',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      await this.prismaService.credentials.create({
        data: {
          email: data.email,
          password: hashedPassword,
        },
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    try {
      user = await this.prismaService.user.create({
        data: {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        },
      });
    } catch (error) {
      await this.prismaService.credentials.delete({
        where: { email: data.email },
      });
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return user;
  };

  login = async (data: LoginDto) => {
    const credentials = await this.prismaService.credentials.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!credentials) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const comparedPassword = await bcrypt.compare(
      data.password,
      credentials.password,
    );

    if (!comparedPassword) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new HttpException('User was not found', HttpStatus.BAD_REQUEST);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: credentials.email,
      },
      process.env.SECRET,
    );

    return {
      token,
    };
  };
}
