import { GenericRepository, IGenericRepository } from './generic.repository';
import { Injectable } from '@nestjs/common';
import { ClickEntity } from '../entities';
import { DbService } from '../db.service';

export interface IClickRepository extends IGenericRepository<ClickEntity> {}

@Injectable()
export class ClickRepository
  extends GenericRepository<ClickEntity>
  implements IClickRepository
{
  constructor(dbService: DbService) {
    const entity = new ClickEntity();
    super(entity, dbService);
  }
}
