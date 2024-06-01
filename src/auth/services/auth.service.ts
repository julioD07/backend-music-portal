import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthUserDto, CreateUserDto, CreateUserWithRolesDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from './roles.service';
import { EncriptarPassAdapter } from '../adapters/encriptar-pass.adapter';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(
    //? Inyectamos el servicio de JWT
    private readonly jwtService: JwtService,

    //? Inyectamos el servicio de roles
    private readonly rolesService: RolesService,

    //? Inyectamos el servicio de Hash
    private readonly encriptarPassAdapter: EncriptarPassAdapter,
  ) {
    super();
  }

  private readonly logger = new Logger(AuthService.name);

  // Método que se ejecuta cuando el módulo se inicializa
  async onModuleInit() {
    //? Conectarse a la base de datos
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  /**
   * Método para validar un usuario por id
   * @param id
   * @returns
   */
  async validateUserById(id: string) {
    //? Obtenemos el usuario por id
    const user = await this.user.findUnique({
      select: {
        //? Seleccionamos los campos que queremos obtener
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        roles: {
          select: {
            roleId: true,
          },
        },
      },
      //? Filtramos por el id
      where: {
        id,
      },
    });

    //? Si no hay usuario, retornamos null
    if (!user) {
      return null;
    }

    //? Obtenemos los roles del usuario
    const roles = user.roles.map((role) => role.roleId);

    //? Obtenemos los nombres de los roles
    const rolesUser = await this.rolesService.getRolesByIds(roles);

    //? Retornamos el usuario con los roles
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      roles: rolesUser,
    };
  }

  /**
   * Método para crear un usuario
   * @param data
   * @returns
   */
  async createUser(data: CreateUserDto) {
    return await this.createUserAll(data, null);
  }

  /**
   * Método para crear un usuario con roles
   * @param data
   * @returns
   */
  async createUserWithRoles(data: CreateUserWithRolesDto) {
    const { roles, ...rest } = data;
    return await this.createUserAll(rest, roles);
  }

  /**
   * Método para loguear un usuario
   * @param authUserDto
   * @returns
   */
  async login(authUserDto: AuthUserDto) {
    //? Buscar el usuario por email
    const user = await this.user.findUnique({
      where: {
        email: authUserDto.email,
      },
      include: {
        roles: {
          select: {
            roleId: true,
          },
        },
      },
    });

    //? Si no se encuentra el usuario, lanzar una excepción
    if (!user) {
      throw new BadRequestException('El usuario no existe');
    }

    //? Si el usuario no está activo, lanzar una excepción
    if (!user.isActive) {
      throw new BadRequestException('El usuario no está activo');
    }

    //? Comparar la contraseña proporcionada con la almacenada
    const validPassword = await this.comparePassword(
      authUserDto.password,
      user.password,
    );

    //? Si la contraseña no es válida, lanzar una excepción
    if (!validPassword) {
      throw new BadRequestException('Contraseña incorrecta');
    }

    //? Obtener los ids de los roles del usuario
    const roles = user.roles.map((role) => role.roleId);
    // console.log(roles);

    //? Obtener los nombres de los roles del usuario
    const rolesUser = await this.rolesService.getRolesByIds(roles);

    // console.log(rolesUser);

    //? Generar un token JWT para el usuario
    const token = this.generateToken({
      id: user.id,
      roles: rolesUser,
    });

    //? Retornar el resultado del login
    return {
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: rolesUser,
      },
    };
  }

  /**
   * Método para comparar la contraseña
   * @param password
   * @param hash
   * @returns
   */
  async comparePassword(password: string, hash: string) {
    //? Comparar la contraseña proporcionada con el hash almacenado
    return this.encriptarPassAdapter.compareSync(password, hash);
    // return password === hash;
  }

  // Método para encontrar un usuario por id
  findUserById(id: string) {
    //? Obtenemos el usuario por id
    return this.user.findUnique({
      select: {
        //? Seleccionamos los campos que queremos obtener
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        roles: {
          select: {
            roleId: true,
          },
        },
      },
      //? Filtramos por el id
      where: {
        id,
      },
    });
  }

  //? Método para encontrar un usuario por email
  async findUserByEmail(email: string) {
    //? Obtenemos el usuario por email
    return this.user.findUnique({
      select: {
        //? Seleccionamos los campos que queremos obtener
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        roles: {
          select: {
            roleId: true,
          },
        },
      },
      //? Filtramos por el email
      where: {
        email,
      },
    });
  }

  private async createUserAll(data: CreateUserDto, rolesEnviated: string[]) {
    try {
      const roleTemp = !rolesEnviated ? ['user'] : rolesEnviated;

      //? Obtener roles por nombre
      const roles = await this.role.findMany({
        where: {
          name: { in: roleTemp },
        },
      });

      //? Verificar si todos los roles fueron encontrados
      if (roles.length !== roleTemp.length) {
        throw new BadRequestException('Uno o más roles no existen');
      }

      const hash = this.encriptarPassAdapter.hashSync(data.password);

      //? Crear el usuario y asociar los roles
      const newUser = await this.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          password: hash,
          roles: {
            create: roles.map((role) => ({
              roleId: role.id,
            })),
          },
        },
        include: { roles: true },
      });

      delete newUser.password;

      //? Generar un token JWT para el usuario
      const token = this.generateToken({
        id: newUser.id,
        roles: roles.map((role) => role.name),
      });

      return {
        ok: true,
        user: newUser,
        message: 'Usuario creado correctamente',
        token,
      };
    } catch (error) {
      this.handleErrorsException(error);
    }
  }

  private generateToken(payload: any) {
    //? Generar un token JWT para el usuario
    return this.jwtService.sign(payload);
  }

  private handleErrorsException(error: any) {
    if (error.code === 'P2002') {
      throw new BadRequestException('El email ya está registrado');
    }

    console.log(error.code);
    console.log(error.message);
    throw new InternalServerErrorException(error.message);
  }
}
