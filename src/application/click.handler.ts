import { ClickRepository } from "../infrastructure/database/repositories";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Controller } from "@nestjs/common";

@Controller()
export class ClickHandler {
    constructor(private readonly clickRepository: ClickRepository) {}

    @MessagePattern('URL_CLICKED')
    urlClickedHandler(@Payload() data: {
        originalUrl: string;
        code: string;
        userAgent: string;
        ip: string;
    }) {
        this.clickRepository.insert({
            data: {
                url: data.code,
                userAgent: data.userAgent,
                referrer: data.originalUrl,
                country: data.country,
                ipAddress: data.ip,
            },
        });
    }
}