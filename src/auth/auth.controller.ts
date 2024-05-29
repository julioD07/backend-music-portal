import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService, RolesService } from './services';
import { AuthUserDto, CreateUserDto } from './dto';
import { Auth } from './decorators';
import { ValidRoles } from './interfaces';

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

  @Post('register/Role')
  createRole(@Body('name') name: string) {
    return this.rolesService.createRole(name);
  }

  @Post('login')
  login(@Body() authUserDto: AuthUserDto) {
    return this.authService.login(authUserDto);
  }

  @Auth(ValidRoles.admin)
  @Get('protected')
  protected() {
    return 'Protected';
  }

}
