import { IsNotEmpty, IsString } from "class-validator";

export class CreateSongDto {

    @IsString({ message: "El name de la canción debe ser un texto" })
    @IsNotEmpty({ message: "El name de la canción es requerido" })
    name: string;

    @IsString({ message: "El artist de la canción debe ser un texto" })
    @IsNotEmpty({ message: "El artist de la canción es requerido" })
    artist: string;
  }
  