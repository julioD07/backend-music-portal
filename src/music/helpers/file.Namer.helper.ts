import { v4 as uuid } from 'uuid';

//? Funcion para filtrar los archivos que se suben al servidor
export const fileNmer = (
  req: Express.Request,
  file: Express.Multer.File,
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function,
) => {
  // console.log({file});
  if (!file) return callback(new Error('File is empty'), false);

  //? Obtenemos la extension del archivo
  const fileExtension = file.originalname.split('.').pop();

  //? Definimos el nombre del archivo
  const fileName = `${uuid()}.${fileExtension}`;

  //? Si todo sale bien, retornamos true
  callback(null, fileName);
};
