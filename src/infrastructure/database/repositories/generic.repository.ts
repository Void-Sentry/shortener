import { parse } from '../utils/entity-parse';
import { TDbClient, DbConn } from '../index';

export interface IGenericRepository<E> {
  findAll: () => Promise<E[]>;
  findBy: (data: Partial<E>) => Promise<E[] | E>;
  insert: ({ data, client }: { data: Partial<E>; client?: any }) => Promise<E>;
  update: ({
    data,
    client,
  }: {
    data: Partial<E>;
    compositeId?: Partial<E>;
    client?: any;
  }) => Promise<E>;
  delete: (compositeId: Partial<E>) => Promise<void>;
}

export abstract class GenericRepository<E> implements IGenericRepository<E> {
  constructor(private readonly entity: E | any) {}

  // Helper method to build WHERE clause
  private buildWhereClause(
    keys: string[],
    prevLenght = 0,
  ): { clause: string; values: any[] } {
    const clause = keys
      .map(
        (key, index) =>
          `${this.#camelToSnakeCase(key)} = $${prevLenght + index + 1}`,
      )
      .join(' AND ');
    return { clause, values: keys };
  }

  // Helper method to build SET clause
  private buildSetClause(keys: string[]): { clause: string; values: any[] } {
    const clause = keys
      .map((key, index) => `${this.#camelToSnakeCase(key)} = $${index + 1}`)
      .join(', ');
    return { clause, values: keys };
  }

  readonly findAll = async (): Promise<E[]> => {
    const queryString = `SELECT * FROM ${this.entity.__table_name}`;
    const res = await DbConn.query(queryString);
    return parse<E>(res);
  };

  readonly findBy = async (
    data: Partial<E>,
    client?: TDbClient,
    lock?: 'SHARE' | 'UPDATE',
  ): Promise<E[] | E> => {
    const filteredData = Object.entries(data).filter(([_, value]) => value !== undefined && value !== null);
    const keys = filteredData.map(([key]) => key);
    const values = filteredData.map(([_, value]) => value);
  
    let queryStr = `SELECT * FROM ${this.entity.__table_name}`;
  
    if (lock) queryStr += ` FOR ${lock}`;
  
    if (keys.length > 0) {
      const snakeCaseKeys = keys.map(this.#camelToSnakeCase);
      const { clause } = this.buildWhereClause(snakeCaseKeys);
      queryStr += ` WHERE ${clause}`;
    }
  
    const res = await (client ?? DbConn).query(queryStr, values);
  
    const parsed = parse<E>(res);
  
    return parsed.length === 1 ? parsed[0] : parsed;
  };
  

  readonly count = async (): Promise<number> => {
    const queryString = `SELECT COUNT(*) AS total FROM ${this.entity.__table_name}`;
    const res = await DbConn.query(queryString);
    return res.rows[0]['total'];
  };

  readonly insert = async ({
    data,
    client,
  }: {
    data: Partial<E>;
    compositeId?: Partial<E>;
    client?: any;
  }): Promise<E> => {
    this.#removeGenericProperties(data);

    const keys = Object.keys(data);
    const values = Object.values(data);

    const columns = keys.map(this.#camelToSnakeCase).join(', ');
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

    const queryStr = `INSERT INTO ${this.entity.__table_name} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const res = await (client ?? DbConn).query(queryStr, values);

    const parsed = parse<E>(res);

    return parsed[0];
  };

  readonly update = async ({
    data,
    client,
    compositeId,
  }: {
    data: Partial<E>;
    compositeId?: Partial<E>;
    client?: any;
  }): Promise<E> => {
    this.#removeGenericProperties(data);

    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);

    const idKeys = Object.keys(compositeId);
    const idValues = Object.values(compositeId);

    const setClause = this.buildSetClause(dataKeys).clause;
    const whereClause = this.buildWhereClause(idKeys, dataValues.length).clause;

    const queryStr = `UPDATE ${this.entity.__table_name} SET ${setClause} WHERE ${whereClause} RETURNING *`;

    const res = await (client ?? DbConn).query(queryStr, [
      ...dataValues,
      ...idValues,
    ]);
    const parsed = parse<E>(res);

    return parsed[0];
  };

  readonly delete = async (compositeId: Partial<E>): Promise<void> => {
    const idKeys = Object.keys(compositeId);
    const idValues = Object.values(compositeId);

    const whereClause = this.buildWhereClause(idKeys).clause;

    const queryStr = `DELETE FROM ${this.entity.__table_name} WHERE ${whereClause}`;

    await DbConn.query(queryStr, idValues);
  };

  readonly transaction = async <T>(data: {
    client: TDbClient;
    callback: () => Promise<T>;
    success: () => Promise<any>;
    error: (error: any) => Promise<any>;
  }): Promise<T> => {
    const backoffInterval = 100; // millis
    const maxTries = 5;
    let tries = 0;

    while (true) {
      await DbConn.beginTransaction(data.client);
      tries++;

      try {
        const result = await data.callback();
        await DbConn.commitTransaction(data.client);
        await data.success();
        return result;
      } catch (error) {
        await DbConn.rollbackTransaction(data.client);

        if (error.code === '40001' && tries < maxTries) {
          console.log('Transaction failed. Retrying.');
          console.log(error.message);
          await new Promise((r) => setTimeout(r, tries * backoffInterval));
          continue;
        }

        await data.error(error);

        throw error;
      }
    }
  };

  readonly #removeGenericProperties = (data: any) => {
    if (data?.toModel) delete data.toModel;

    if (data?.__table_name) delete data.__table_name;

    if (data?.add) delete data.add;

    if (data?.sub) delete data.sub;

    if (data?.transform) delete data.transform;

    if (data?.checkAndFix) delete data.checkAndFix;
  };

  readonly #camelToSnakeCase = (str: string): string =>
    str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}
