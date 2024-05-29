import { UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export const Auth = (...roles: ValidRoles[]) => {

    return applyDecorators(
        //? Decorator de NestJS para proteger rutas
        //? Enviamos los roles validos para el endpoint
        RoleProtected(...roles),
        //? Enviamos los guards que queremos usar
        UseGuards(AuthGuard(), UserRoleGuard)
    )
};
