import { Controller } from '@nestjs/common';
import { Get, Post, Delete, Param } from '@nestjs/common/decorators';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto } from './dtos/profile-response.dto';
import { User } from '@prisma/client';

@Controller('profiles/:username')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  getProfile(
    @Param('username') username: string,
    @CurrentUser() user: User,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.getProfile(username, user);
  }

  @Post('follow')
  followUser(
    @Param('username') username: string,
    @CurrentUser() user: User,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.followUser(username, user);
  }

  @Delete('follow')
  unfollowUser(
    @Param('username') username: string,
    @CurrentUser() user: User,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.unfollowUser(username, user);
  }
}
