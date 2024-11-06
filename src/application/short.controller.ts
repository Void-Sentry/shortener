import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard, RequestWithUser } from "../presentation/guards/auth.guard";
import { OptionalAuthGuard } from "../presentation/guards/optional-auth.guard";
import { EditOriginalUrlDto, UrlIdDto } from "../presentation/dtos";
import { UrlEntity } from "../infrastructure/database/entities";
import { ShortService } from "./short.service";

@ApiTags('URL Shortener')
@Controller('short')
export class ShortController {
    constructor(private readonly shortService: ShortService) {}

    @ApiOperation({ summary: 'List user shortened URLs' })
    @ApiResponse({
        status: 200,
        type: [UrlEntity],
        description: 'Returns an array of shortened URLs associated with the authenticated user',
    })
    @UseGuards(OptionalAuthGuard)
    @Get()
    list(@Req() req: RequestWithUser) {
        return this.shortService.urlRepository.findBy({ userId: req.user.sub });
    }

    @ApiOperation({ summary: 'Create a shortened URL' })
    @ApiResponse({
        status: 201,
        type: 'string',
        description: 'Creates a shortened URL and returns the URL entity',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid URL format or missing required fields',
    })
    @UseGuards(OptionalAuthGuard)
    @Post()
    create(@Req() req: RequestWithUser, @Body() { originalUrl }: EditOriginalUrlDto) {
        return this.shortService.shortenUrl(originalUrl, req?.user?.sub);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Edit an existing shortened URL' })
    @ApiResponse({
        status: 200,
        type: UrlEntity,
        description: 'Updates the original URL for the specified shortened URL ID',
    })
    @ApiResponse({
        status: 404,
        description: 'URL not found or does not belong to the authenticated user',
    })
    @ApiResponse({
        status: 403,
        description: 'Unauthorized to edit this URL',
    })
    @UseGuards(AuthGuard)
    @Patch('/:id')
    edit(@Req() req: RequestWithUser, @Param() { id }: UrlIdDto, @Body() { originalUrl }: EditOriginalUrlDto) {
        return this.shortService.urlRepository.update({
            data: { originalUrl },
            compositeId: {
                id,
                userId: req.user.sub,
            },
        });
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a shortened URL' })
    @ApiResponse({
        status: 200,
        type: UrlEntity,
        description: 'Marks the specified shortened URL as deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'URL not found or does not belong to the authenticated user',
    })
    @ApiResponse({
        status: 403,
        description: 'Unauthorized to delete this URL',
    })
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
