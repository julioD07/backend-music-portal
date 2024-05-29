import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(AuthService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async validateUserById(id: string) {
    return await this.user.findUnique({
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true, 
      },
      where: {
        id,
      },
    });
  }

  async createUser(data: CreateUserDto) {
    return await this.user.create({
      data: {
        ...data,
        roles: {
          create: data.roles.map((role) => ({ name: role })),
        },
      },
    });
  }

  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
