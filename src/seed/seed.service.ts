import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService, RolesService } from 'src/auth/services';

@Injectable()
export class SeedService {
  constructor(
    //? Inyectamos el authService para poder utilizar sus metodos
    //? y poder crear un usuario administrador
    private readonly authService: AuthService,

    //? Inyectamos el rolesService para poder utilizar sus metodos
    //? y poder crear los roles de admin y user
    private readonly rolesService: RolesService,
  ) {}

  async ejecutarSeed() {

    //? validamos si el rol admin y user ya existen
    const [adminRole, userRole] = await Promise.all([
      this.rolesService.getRoleByName('admin'),
      this.rolesService.getRoleByName('user'),
    ]);

    if (adminRole && userRole) {
      throw new BadRequestException('Los roles ya existen');
    }

    //? Creamos el rol admin y user
    const [] = await Promise.all([
      this.rolesService.createRole('admin'),
      this.rolesService.createRole('user'),
    ]);

    //? Validamos si el usuario administrador ya existe
    const existUser = await this.authService.findUserByEmail(
      'jdonado@unibol.com.co',
    );

    //? Validamos si el usuario ya existe
    if (existUser) {
      throw new BadRequestException('El usuario administrador ya existe 2');
    }

    //? Realizamos la creación de un usuario administrador
    await this.authService.createUserWithRoles({
      email: 'jdonado@unibol.com.co',
      fullName: 'Julio Donado',
      password: '123456',
      roles: ['admin'],
    });

    return {
      ok: true,
      message: 'Datos iniciales creados correctamente',
    };
  }
}
