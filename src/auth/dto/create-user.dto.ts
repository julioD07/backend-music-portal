import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateUserDto {
    @IsString({ message: 'El fullName debe ser un texto' })
    @IsNotEmpty({ message: 'El fullName es requerido' })
    fullName: string;

    @IsString({ message: 'El email debe ser un texto' })
    @IsNotEmpty({ message: 'El email es requerido' })
    @IsEmail({}, { message: 'El email debe ser un email válido' })
    email: string;

    @IsString({ message: 'La password debe ser un texto' })
    @IsNotEmpty({ message: 'La password es requerida' })
    password: string;

    @IsOptional()
    isActive?: boolean = true;

    // @IsNotEmpty({ message: 'Los roles son requeridos' })
    // @IsArray({ message: 'Los roles deben ser un arreglo' })
    // roles: string[];
}

export class CreateUserWithRolesDto extends CreateUserDto {
    @IsNotEmpty({ message: 'Los roles son requeridos' })
    @IsArray({ message: 'Los roles deben ser un arreglo' })
    roles: string[];
}