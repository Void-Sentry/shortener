import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/presentation/auth.guard";
import { ShortService } from "./short.service";

@Controller()
export class ShortController {
    constructor(private readonly shortService: ShortService) {}

    @UseGuards(AuthGuard)
    @Get()
    list() {
        return this.shortService.urlRepository.findBy({ userId: 1 });
    }

    @Post()
    create(@Body() { originalUrl }: any) {
        return this.shortService.shortenUrl(originalUrl, 1);
    }

    @UseGuards(AuthGuard)
    @Patch()
    edit() {
        return this.shortService.urlRepository.update({
            data: { originalUrl: '' },
            compositeId: {
                id: '',
            },
        });
    }

    @UseGuards(AuthGuard)
    @Delete()
    async destroy() {
        const deleted = await this.shortService.urlRepository.update({
            data: { deletedAt: new Date() },
            compositeId: { id: '' },
        });
        return deleted;
    }
}