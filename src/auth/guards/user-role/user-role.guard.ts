import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { Request } from 'express';
// import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { RolesService } from 'src/auth/services';


@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    //? Inyectamos el reflector
    private readonly reflector: Reflector,

    //? Inyectamos el auth service
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  )
  // : boolean | Promise<boolean> | Observable<boolean> | Promise<any> 
  {
    //? Obtenemos los roles validos para el endpoint desde el reflector
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    //? Si no hay roles validos, permitimos el acceso
    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    //? Obtenemos el usuario desde el request
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as User;

    // console.log(user);
    //? Si no hay usuario, lanzamos un error
    if (!user) throw new BadRequestException(`User not Found`);

  
    //? Obtenemos los roles del usuario
    const roles = await this.rolesService.getRolesByUserId(user.id)
    // const userRoles = user.roles.map((role) => role.name);
    for (const rol of roles) {
      if (validRoles.includes(rol)) return true;
    }

    //? Si el usuario no tiene un rol valido, lanzamos un error
    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]`,
    );

  }
}
