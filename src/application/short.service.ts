import { UrlRepository } from "../infrastructure/database/repositories";
import { Inject, Injectable } from "@nestjs/common";
import { ClientRMQ } from "@nestjs/microservices";
import { ShortModel } from "../domain";
import { CacheService } from "src/infrastructure/cache/cache.service";

@Injectable()
export class ShortService {
    constructor(
        @Inject('REDIRECTOR_CLIENT')
        private readonly redirectorClient: ClientRMQ,
        private readonly shortModel: ShortModel,
        readonly urlRepository: UrlRepository,
        private readonly cacheService: CacheService,
    ) {}

    readonly urlWithClicks = async (data: { userId: string; clientId: string; }) => {
        const res = await this.urlRepository.urlWithClicks(data);
        const mapped = res.map(async (r) => {
            const expireAt = await this.cacheService.client.ttl(r.code);
            return {
                ...r,
                expiredAt: new Date(Date.now() + expireAt * 1000).toLocaleDateString(),
            }
        });

        return Promise.all(mapped);
    };

    readonly shortenUrl = async (originalUrl: string, user?: { sub: string; client_id: string; }): Promise<string> => {
        const urlCount = await this.urlRepository.count();
        const shortCode = await this.shortModel.generateShortCode(urlCount);

        const urlEntity = await this.urlRepository.insert({
            data: {
                originalUrl,
                shortCode,
                userId: user.sub,
                clientId: user?.client_id,
            },
        });
        const url = this.shortModel.generateShortUrl(urlEntity);

        this.redirectorClient.emit('URL_GENERATED', { originalUrl, code: shortCode });

        return url;
    };
}