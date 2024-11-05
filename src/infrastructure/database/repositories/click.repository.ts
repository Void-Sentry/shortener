import { GenericRepository, IGenericRepository } from './generic.repository';
import { Injectable } from '@nestjs/common';
import { ClickEntity } from '../entities';

export interface IClickRepository extends IGenericRepository<ClickEntity> {}

@Injectable()
export class ClickRepository
  extends GenericRepository<ClickEntity>
  implements IClickRepository
{
  constructor() {
    const entity = new ClickEntity();
    super(entity);
  }
}
