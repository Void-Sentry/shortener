import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  readonly listAll = (): string => {
    return 'Hello World!';
  };

  readonly edit = () => {

  };

  readonly softDelete = () => {

  };
}
