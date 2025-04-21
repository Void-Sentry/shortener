import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import { ConfigService } from '../config';

@Injectable()
export class CacheService implements OnModuleInit {
    readonly client: RedisClientType;

    constructor(private readonly configService: ConfigService) {
        this.client = createClient({
            url: this.configService.get('CACHE_URL'),
        });
    }

    readonly onModuleInit = async () => {
        await this.client.connect();
    };
}
