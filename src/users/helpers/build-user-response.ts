import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

type SafeUser = Omit<User, 'password'>;

export function buildUserResponse(user: SafeUser) {
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio ?? '',
      image: user.image ?? null,
    },
  };
}

export function buildUserWithTokenResponse(
  user: SafeUser,
  jwtService: JwtService,
) {
  const token = jwtService.sign({
    sub: user.id,
    username: user.username,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio ?? '',
      image: user.image ?? null,
      token,
    },
  };
}
