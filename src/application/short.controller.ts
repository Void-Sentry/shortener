import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, RequestWithUser } from "src/presentation/guards/auth.guard";
import { OptionalAuthGuard } from "src/presentation/guards/optional-auth.guard";
import { EditOriginalUrlDto, UrlIdDto } from "src/presentation/dtos";
import { ShortService } from "./short.service";

@Controller()
export class ShortController {
    constructor(private readonly shortService: ShortService) {}

    @UseGuards(OptionalAuthGuard)
    @Get()
    list(@Req() req: RequestWithUser) {
        return this.shortService.urlRepository.findBy({ userId: req.user.sub });
    }

    @UseGuards(OptionalAuthGuard)
    @Post()
    create(@Req() req: RequestWithUser, @Body() { originalUrl }: EditOriginalUrlDto) {
        return this.shortService.shortenUrl(originalUrl, req?.user.sub);
    }

    @UseGuards(AuthGuard)
    @Patch()
    edit(@Req() req: RequestWithUser, @Param() { id }: UrlIdDto, @Body() { originalUrl }: EditOriginalUrlDto) {
        return this.shortService.urlRepository.update({
            data: { originalUrl },
            compositeId: {
                id,
                userId: req.user.sub,
            },
        });
    }

    @UseGuards(AuthGuard)
    @Delete('/:id')
    async destroy(@Req() req: RequestWithUser, @Param() { id }: UrlIdDto) {
        const deleted = await this.shortService.urlRepository.update({
            data: { deletedAt: new Date() },
            compositeId: { id, userId: req.user.sub },
        });
        return deleted;
    }
}