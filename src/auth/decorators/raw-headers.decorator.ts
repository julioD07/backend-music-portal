import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    //? Obtenemos la request
    const req = ctx.switchToHttp().getRequest();
    //? Retornamos los headers
    return req.rawHeaders;
  },
);
