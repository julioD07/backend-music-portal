import { Injectable } from '@nestjs/common';
import { HashAdapter } from '../interfaces';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncriptarPassAdapter implements HashAdapter {
  //? Inyectamos el paquete de brcypt para poder usarlo en la clase
  private readonly bcrypt = bcrypt;
  private readonly saltRounds = 10;

  //? Implementamos el método hashSync de la interfaz HashAdapter
  hashSync(password: string): string {
    try {
      //? Usamos el método hashSync de bcrypt para encriptar la contraseña
      return this.bcrypt.hashSync(password, this.saltRounds);
    } catch (error) {
      console.log(error);
    }
  }

  //? Implementamos el método compareSync de la interfaz HashAdapter
  compareSync(password: string, hash: string): boolean {
    try {
      //? Usamos el método compareSync de bcrypt para comparar la contraseña con el hash
      return this.bcrypt.compareSync(password, hash);
    } catch (error) {
      console.log(error);
    }
  }
}
