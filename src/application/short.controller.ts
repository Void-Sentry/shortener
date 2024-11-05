import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { ShortService } from "./short.service";

@Controller()
export class ShortController {
    constructor(private readonly shortService: ShortService) {}

    @Get()
    list() {
        return this.shortService.urlRepository.findBy({ userId: 1 });
    }

    @Post()
    create(@Body() { originalUrl }: any) {
        return this.shortService.shortenUrl(originalUrl, 1);
    }

    @Patch()
    edit() {
        return this.shortService.urlRepository.update({
            data: { originalUrl: '' },
            compositeId: {
                id: '',
            },
        });
    }

    @Delete()
    async destroy() {
        const deleted = await this.shortService.urlRepository.update({
            data: { deletedAt: new Date() },
            compositeId: { id: '' },
        });
        return deleted;
    }
}