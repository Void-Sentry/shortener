import { GenericRepository, IGenericRepository } from './generic.repository';
import { Injectable } from '@nestjs/common';
import { UrlEntity } from '../entities';

export interface IUrlRepository extends IGenericRepository<UrlEntity> {}

@Injectable()
export class UrlRepository
  extends GenericRepository<UrlEntity>
  implements IUrlRepository
{
  constructor() {
    const entity = new UrlEntity();
    super(entity);
  }
}
