import { GenericRepository, IGenericRepository } from './generic.repository';
import { parse } from '../utils/entity-parse';
import { Injectable } from '@nestjs/common';
import { UrlEntity } from '../entities';
import { DbConn } from '..';

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

  readonly urlWithClicks = async (data: { userId: string; clientId?: string; }) => {
    const client = await DbConn.getClient();

    try {
      const clientId = data.clientId ?? null;

      const res = await client.query(`
        SELECT
          COALESCE(COUNT(c.*), 0) AS total_click,
          u.short_code AS code,
          u.original_url AS original_url
        FROM urls u
        LEFT JOIN clicks c ON c.url = u.short_code
          AND c.referrer = u.original_url
        WHERE user_id = $1
          AND (u.client_id = $2 OR $2 IS NULL)
        GROUP BY u.short_code, u.original_url;
      `, [data.userId, clientId]);
  
      return parse<{
        totalClick: number;
        code: string;
        originalUrl: string;
      }>(res);
    } catch (e) {
      console.log(e);
    } finally {
      client.release();
    }
  };
}
