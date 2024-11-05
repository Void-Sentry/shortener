import { Inject, Injectable } from "@nestjs/common";
import { ShortModel } from "src/domain";
import { UrlEntity } from "src/infrastructure/database/entities";
import { Repository } from "typeorm";

@Injectable()
export class ShortService {
    constructor(
        @Inject('URL_REPOSITORY')
        readonly urlRepository: Repository<UrlEntity>,
        private readonly shortModel: ShortModel,
    ) {}

    readonly shortenUrl = async (originalUrl: string, userId?: number): Promise<string> => {
        const urlCount = 100;
        const shortCode = await this.shortModel.generateShortCode(urlCount);

        const url = this.urlRepository.create({ originalUrl, shortCode, userId });
        await this.urlRepository.save(url);

        return shortCode;
    };
}