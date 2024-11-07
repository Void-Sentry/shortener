import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class CacheService implements OnModuleInit {
    readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.CACHE_URL,
        });
    }

    readonly onModuleInit = async () => {
        await this.client.connect();
    };
}
