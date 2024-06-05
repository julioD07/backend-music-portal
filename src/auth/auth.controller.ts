import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService, RolesService } from './services';
import { AuthUserDto, CreateUserDto, CreateUserWithRolesDto } from './dto';
import { Auth } from './decorators';
import { ValidRoles } from './interfaces';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    private readonly rolesService: RolesService,
  ) {}

  @Post('register/user')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('register/user/role')
  createUserWithRoles(@Body() createUserWithRolesDto: CreateUserWithRolesDto) {
    return this.authService.createUserWithRoles(createUserWithRolesDto);
  }

  @Post('register/Role')
  createRole(@Body('name') name: string) {
    return this.rolesService.createRole(name);
  }

  @Post('login')
  login(@Body() authUserDto: AuthUserDto) {
    return this.authService.login(authUserDto);
  }

  @Auth(ValidRoles.admin, ValidRoles.user)
  @Get('protected')
  protected(@Req() req: Request) {
    // console.log(req.user);
    return {
      ok: true,
      ...req.user,
    }
  }

}
