import { Body, Controller, Get, Post, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from '../authentication/local-auth.guard';
import { UserRegistrationDto } from './user.model';
import { UserService } from './user.service';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/login')
  @Render('loginUser')
  getUserLoginPage() {
    return {
      afterLoginGoTo:
        '/authorize?response_type=code&client_id=1234&redirect_uri=https://youtube.com&scope=profile'
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  loginUser(@Res() res: Response) {
    res.sendStatus(201);
  }

  @Get('/register')
  @Render('registerUser')
  getUserRegistrationPage() {
    return {};
  }

  @Post('/register')
  async registerUser(@Body() user: UserRegistrationDto, @Res() res: Response) {
    await this.userService.insertOne(user);
    res.sendStatus(201);
  }
}
