import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RolesService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  // Método que se ejecuta cuando el módulo se inicializa
  async onModuleInit() {
    //? Conectarse a la base de datos
    await this.$connect();
    // this.logger.log('Connected to the database');
  }

  /**
   * Método para crear un rol
   * @param name
   * @returns
   */
  async createRole(name: string) {
    //? Crear un nuevo rol
    return this.role.create({
      data: { name },
    });
  }

  /**
   * Método para obtener un rol por nombre
   * @param name
   * @returns
   */
  async getRoleByName(name: string) {
    //? Buscar el rol por nombre
    return this.role.findUnique({
      where: { name },
    });
  }

  /**
   * Método para obtener los roles por id
   * @param ids
   * @returns
   */
  async getRolesByIds(ids: string[]) {
    //? Obtener roles por sus ids
    const rolesUser = await this.role.findMany({
      select: {
        //? Seleccionar el nombre del rol
        name: true,
      },
      where: {
        id: {
          //? Filtrar por los ids
          in: ids,
        },
      },
    });
    //? Retornar los nombres de los roles
    return rolesUser.map((role) => role.name);
  }

  // Método para obtener los roles de un usuario por su id
  async getRolesByUserId(id: string) {
    //? Buscar el usuario por id
    const user = await this.user.findUnique({
      where: {
        id,
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
      throw new BadRequestException('User not found');
    }

    //? Obtener los ids de los roles del usuario
    const roles = user.roles.map((role) => role.roleId);

    //? Obtener los roles por sus ids
    return await this.getRolesByIds(roles);
  }
}
