import { GenericEntity, IGenericEntity } from './generic.entity';

export interface IUrl extends IGenericEntity {
  id: string;
  shortCode: string;
  originalUrl: string;
  userId?: string;
  clientId?: string;
}

export class UrlEntity
  extends GenericEntity
  implements IUrl
{
  id: string;
  shortCode: string;
  originalUrl: string;
  userId?: string;
  clientId?: string;

  constructor(data?: Partial<IUrl>) {
    super('urls');
    Object.assign(this, data);
  }
}
