import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildProfileResponse } from './helpers/build-profile-response';
import { User } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(username: string, currentUser: User) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isFollowing = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: user.id,
        },
      },
    });

    return buildProfileResponse(user, !!isFollowing);
  }

  async followUser(username: string, currentUser: User) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === currentUser.id) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const alreadyFollowing = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: user.id,
        },
      },
    });

    if (alreadyFollowing) {
      throw new BadRequestException('Already following');
    }

    await this.prisma.userFollow.create({
      data: {
        followerId: currentUser.id,
        followingId: user.id,
      },
    });

    return buildProfileResponse(user, true);
  }

  async unfollowUser(username: string, currentUser: User) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const follow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: user.id,
        },
      },
    });

    if (!follow) {
      throw new BadRequestException('You are not following this user');
    }

    return buildProfileResponse(user, false);
  }
}
