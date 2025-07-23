import { Expose } from 'class-transformer';

export class ProfileDto {
  @Expose()
  username: string;

  @Expose()
  bio: string | null;

  @Expose()
  image: string | null;

  @Expose()
  following: boolean;
}

export class ProfileResponseDto {
  @Expose()
  profile: ProfileDto;
}
