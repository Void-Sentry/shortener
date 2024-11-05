import { ClickRepository } from "src/infrastructure/database/repositories";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Controller } from "@nestjs/common";

@Controller()
export class ClickHandler {
    constructor(private readonly clickRepository: ClickRepository) {}

    @MessagePattern('URL_CLICKED')
    urlClickedHandler(@Payload() data: any) {
        this.clickRepository.insert({
            data: {
                url: data.url,
                userAgent: data.agent,
                referrer: data.referrer,
                country: data.country,
                ipAddress: data.ip,
            },
        });
    }
}