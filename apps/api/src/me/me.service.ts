import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { User, UsersRepository } from '@/auth/repositories/users.repository';

export type MeProfile = Pick<
  User,
  'id' | 'nickname' | 'provider' | 'createdAt'
>;

function toProfile(user: User): MeProfile {
  return {
    id: user.id,
    nickname: user.nickname,
    provider: user.provider,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class MeService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMe(userId: string): Promise<MeProfile> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppException('RESOURCE_NOT_FOUND', 'User not found.');
    }

    return toProfile(user);
  }

  async updateNickname(userId: string, nickname: string): Promise<MeProfile> {
    const user = await this.usersRepository.updateNickname(userId, nickname);

    if (!user) {
      throw new AppException('RESOURCE_NOT_FOUND', 'User not found.');
    }

    return toProfile(user);
  }

  async deleteMe(userId: string): Promise<void> {
    await this.usersRepository.deleteById(userId);
  }
}
