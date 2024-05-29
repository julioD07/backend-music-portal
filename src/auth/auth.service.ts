import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { AuthUserDto, CreateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  private readonly logger = new Logger(AuthService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async validateUserById(id: string) {
    const user = await this.user.findUnique({
      select: {
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
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    const roles = user.roles.map((role) => role.roleId);

    const rolesUser = await this.getRolesByIds(roles);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      roles: rolesUser,
    };
  }

  /**
   *  Metodo para crear un usuario
   * @param data
   * @returns
   */
  async createUser(data: CreateUserDto) {
    // Fetch roles by name
    const roles = await this.role.findMany({
      where: {
        name: { in: data.roles },
      },
    });

    if (roles.length !== data.roles.length) {
      throw new BadRequestException('Some roles not found');
    }

    return await this.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        password: data.password,
        roles: {
          create: roles.map((role) => ({
            roleId: role.id,
          })),
        },
      },
      include: { roles: true },
    });
  }

  /**
   * Metodo para crear un rol
   * @param name
   * @returns
   */
  async createRole(name: string) {
    return this.role.create({
      data: { name },
    });
  }

  /**
   * Metodo para obtener un rol por nombre
   * @param name
   * @returns
   */
  async getRoleByName(name: string) {
    return this.role.findUnique({
      where: { name },
    });
  }

  /**
   * Metodo para obtener los roles por id
   * @param ids
   * @returns
   */
  async getRolesByIds(ids: string[]) {
    //? Obtenemos los roles del usuario
    const rolesUser = await this.role.findMany({
      select: {
        //? Seleccionamos el nombre del rol
        name: true,
      },
      where: {
        id: {
          //? Filtramos por los ids
          in: ids,
        },
      },
    });
    //? Retornamos los nombres de los roles
    return rolesUser.map((role) => role.name);
  }

  /**
   *  Metodo para loguear un usuario
   * @param authUserDto
   * @returns
   */
  async login(authUserDto: AuthUserDto) {
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

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('User is not active');
    }

    const validPassword = await this.comparePassword(
      authUserDto.password,
      user.password,
    );

    if (!validPassword) {
      throw new BadRequestException('Invalid password');
    }

    const roles = user.roles.map((role) => role.roleId);
    console.log(roles);

    const rolesUser = await this.getRolesByIds(roles);

    console.log(rolesUser);

    // const rolesUserNames = rolesUser.map((role) => role.name);

    const token = this.jwtService.sign({
      id: user.id,
      roles: rolesUser,
    });

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
   *  Metodo para comparar la contraseña
   * @param password
   * @param hash
   * @returns
   */
  async comparePassword(password: string, hash: string) {
    return password === hash;
  }

  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
