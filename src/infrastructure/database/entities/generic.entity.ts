export interface IGenericEntity {
    __table_name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export class GenericEntity implements IGenericEntity {
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;

    constructor(public __table_name: string) { }

    toModel = <T, S>(data: S, ModelClass: new (data?: any) => T): T =>
        Object.assign(new ModelClass({} as T), data);
}
