import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async register(email: string, username: string, password: string, referralCode?: string) {
    const existingUser = await this.userRepository.findOne({ where: [{ email }, { username }] });
    if (existingUser) throw new ConflictException('Email or username already taken');

    const user = this.userRepository.create({ email, username, password });
    await user.hashPassword();
    
    user.referralCode = `${username}-${Math.random().toString(36).substr(2, 5)}`;

    if (referralCode) {
      const referrer = await this.userRepository.findOne({ where: { referralCode } });
      if (!referrer) throw new NotFoundException('Invalid referral code');
      user.referredBy = referrer;
    }

    return await this.userRepository.save(user);
  }

  async validateUser(usernameOrEmail: string, password: string) {
    const user = await this.userRepository.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
    if (!user || !(await user.validatePassword(password))) throw new NotFoundException('Invalid credentials');
    return user;
  }

  async generateJwt(user: User) {
    return jwt.sign({ id: user.id }, this.configService.get('JWT_SECRET'), { expiresIn: '7d' });
  }
}
