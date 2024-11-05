import { ClickEntity } from "src/infrastructure/database/entities";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Controller, Inject } from "@nestjs/common";
import { Repository } from "typeorm";

@Controller()
export class ClickHandler {
    constructor(
        @Inject('CLICK_REPOSITORY')
        private readonly clickRepository: Repository<ClickEntity>,
    ) {}

    @MessagePattern('URL_CLICKED')
    urlClickedHandler(@Payload() data: any) {
        this.clickRepository.save({
            url: data.url,
            userAgent: data.agent,
            referrer: data.referrer,
            country: data.country,
            ipAddress: data.ip,
        });
    }
}