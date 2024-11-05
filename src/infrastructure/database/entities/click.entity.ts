import { GenericEntity, IGenericEntity } from './generic.entity';

export interface IClick extends IGenericEntity {
    id: number;
    userAgent: string;
    ipAddress: string;
    referrer: string;
    country: string;
    url: string;
}

export class ClickEntity
    extends GenericEntity
    implements IClick {

    id: number;
    userAgent: string;
    ipAddress: string;
    referrer: string;
    country: string;
    url: string;

    constructor(data?: Partial<IClick>) {
        super('clicks');
        Object.assign(this, data);
    }
}
