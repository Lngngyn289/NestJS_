import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { buildUserResponse } from 'src/users/helpers/build-user-response';
import { UpdateUserDto } from './dtos/update-user.dto';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: any) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getCurrentUser(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return buildUserResponse(user);
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.findByEmail(dto.email);
      if (existingEmail && existingEmail.id !== userId) {
        throw new UnauthorizedException('Email already exists');
      }
    }

    if (dto.username && dto.username !== user.username) {
      const existingUsername = await this.findByUsername(dto.username);
      if (existingUsername && existingUsername.id !== userId) {
        throw new UnauthorizedException('Username already exists');
      }
    }

    if (dto.password) {
      if (!dto.confirmPassword) {
        throw new UnauthorizedException('Please confirm your password');
      }
      if (dto.password !== dto.confirmPassword) {
        throw new UnauthorizedException(
          'Password and password confirmation do not match',
        );
      }
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email ?? user.email,
        username: dto.username ?? user.username,
        password: dto.password ?? user.password,
        bio: dto.bio ?? user.bio,
        image: dto.image ?? user.image,
      },
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return buildUserResponse(updatedUser);
  }
}
