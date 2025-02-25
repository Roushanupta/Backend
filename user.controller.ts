import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { User } from './user.entity';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body) {
    const { email, username, password, referralCode } = body;
    const user = await this.userService.register(email, username, password, referralCode);
    return { message: 'Registration successful', user };
  }

  @Post('login')
  async login(@Body() body) {
    const { usernameOrEmail, password } = body;
    const user = await this.userService.validateUser(usernameOrEmail, password);
    const token = await this.userService.generateJwt(user);
    return { token, user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('referrals')
  async getReferrals(@CurrentUser() user: User) {
    return user.referredUsers;
  }

  @UseGuards(JwtAuthGuard)
  @Get('referral-stats')
  async getReferralStats(@CurrentUser() user: User) {
    return { referralCount: user.referredUsers.length };
  }
}
