import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthUserDto {
  @IsEmail({}, { message: 'email invalido' })
  @IsNotEmpty({ message: 'email requerido' })
  @IsString({ message: 'email debe ser un string' })
  email: string;

  @IsNotEmpty({ message: 'password requerido' })
  @IsString({ message: 'password debe ser un string' })
  password: string;
}
