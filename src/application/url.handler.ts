import { UrlRepository } from "src/infrastructure/database/repositories";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Controller } from "@nestjs/common";

@Controller()
export class UrlHandler {
    constructor(private readonly urlRepository: UrlRepository) {}

    @MessagePattern('URL_EXPIRED')
    urlExpiredHandler(@Payload() data: { code: string; }) {
        this.urlRepository.delete({ shortCode: data.code });
    }
}