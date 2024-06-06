
//? Funcion para filtrar los archivos que se suben al servidor
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => {

    // console.log({file});
    if (!file) return callback( new Error('File is empty'), false)

    //? Obtenemos la extension del archivo
    const fileExtension = file.originalname.split('.').pop();
    // console.log({fileExtension});
    //? Definimos las extensiones validas
    const validExtensions = ['jpg', 'jpeg', 'png', 'mp3'];

    //? Validamos si la extension del archivo es valida
    if (!validExtensions.includes(fileExtension)) return callback(null, false)

    //? Si todo sale bien, retornamos true
    callback(null, true)
};