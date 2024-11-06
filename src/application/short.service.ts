import { UrlRepository } from "../infrastructure/database/repositories";
import { Inject, Injectable } from "@nestjs/common";
import { ClientRMQ } from "@nestjs/microservices";
import { ShortModel } from "../domain";

@Injectable()
export class ShortService {
    constructor(
        @Inject('REDIRECTOR_CLIENT')
        private readonly redirectorClient: ClientRMQ,
        private readonly shortModel: ShortModel,
        readonly urlRepository: UrlRepository,
    ) {}

    readonly shortenUrl = async (originalUrl: string, userId?: number): Promise<string> => {
        const urlCount = await this.urlRepository.count();
        const shortCode = await this.shortModel.generateShortCode(urlCount);

        const urlEntity = await this.urlRepository.insert({ data: { originalUrl, shortCode, userId } });
        const url = this.shortModel.generateShortUrl(urlEntity);

        this.redirectorClient.emit('URL_GENERATED', { originalUrl, url });

        return url;
    };
}