import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/services';

@Injectable()
export class SeedService {
  constructor(
    //? Inyectamos el authService para poder utilizar sus metodos
    //? y poder crear un usuario administrador
    private readonly authService: AuthService,
  ) {}

  async ejecutarSeed() {
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
