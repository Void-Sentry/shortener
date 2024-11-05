import { UrlEntity } from "src/infrastructure/database/entities";
import { Inject, Injectable } from "@nestjs/common";
import { ShortModel } from "src/domain";
import { Repository } from "typeorm";
import { UrlRepository } from "src/infrastructure/database/repositories";

@Injectable()
export class ShortService {
    constructor(
        readonly urlRepository: UrlRepository,
        private readonly shortModel: ShortModel,
    ) {}

    readonly shortenUrl = async (originalUrl: string, userId?: number): Promise<string> => {
        const urlCount = await this.urlRepository.count();
        const shortCode = await this.shortModel.generateShortCode(urlCount);

        const urlEntity = await this.urlRepository.insert({ data: { originalUrl, shortCode, userId } });
        const url = this.shortModel.generateShortUrl(urlEntity);

        return url;
    };
}