import { QueryArrayResult } from 'pg';

const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

export const parse = <E>(items: QueryArrayResult<E[]>) =>
  items.rows.map<E>((item) =>
    items.fields.reduce((obj, key) => {
      const camelKey = toCamelCase(key.name);
      obj[camelKey] = item[key.name];
      return obj;
    }, {} as E),
  );
