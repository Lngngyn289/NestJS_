import { User } from '@prisma/client';
import { ProfileResponseDto } from '../dtos/profile-response.dto';

export function buildProfileResponse(
  user: User,
  isFollowing: boolean,
): ProfileResponseDto {
  return {
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: isFollowing,
    },
  };
}
