import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard, RequestWithUser } from "../presentation/guards/auth.guard";
import { TokenGuard } from "src/presentation/guards/token-required.guard";
import { EditOriginalUrlDto, UrlIdDto } from "../presentation/dtos";
import { UrlEntity } from "../infrastructure/database/entities";
import { ShortService } from "./short.service";
import { FastifyReply } from "fastify";
import { createHmac } from "crypto";

@ApiTags('URL Shortener')
@UseGuards(AuthGuard)
@Controller('short')
export class ShortController {
    constructor(private readonly shortService: ShortService) {}

    @ApiOperation({ summary: 'List user shortened URLs' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: [UrlEntity],
        description: 'Returns an array of shortened URLs associated with the authenticated user',
    })
    @Get()
    async list(@Req() req: RequestWithUser, @Res() res: FastifyReply) {
        const sub = req.cookies['sessionId'] || req?.user?.sub;

        if (!sub) return res.status(HttpStatus.OK).send({ status: HttpStatus.OK, msg: [] });

        const entity = await this.shortService.urlRepository.findBy({
            userId: sub,
            clientId: req?.user?.client_id,
        });

        return res.status(HttpStatus.OK).send({ status: HttpStatus.OK, msg: entity });
    }

    @ApiOperation({ summary: 'Create a shortened URL' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: 'string',
        description: 'Creates a shortened URL and returns the URL entity',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid URL format or missing required fields',
    })
    @Post()
    async create(@Req() req: RequestWithUser, @Res() res: FastifyReply, @Body() { originalUrl }: EditOriginalUrlDto) {
        if (!req?.user?.sub) {
            const info = {
                agent: req.headers['user-agent'],
                ip: (process.env.FAKE_IP || req.headers['X-Forwarded-For']) as string,
            };
            const serializedInfo = JSON.stringify(info);
            req.user = {
                sub: createHmac('sha256', process.env.HMAC_SEED)
                    .update(serializedInfo)
                    .digest('hex'),
            };
    
            res.setCookie('sessionId', req.user.sub, {
                maxAge: 24 * 60 * 60 * 1000, // one day in ms
                sameSite: 'strict',
                httpOnly: true,
                secure: false,
                signed: false,
            });
        }

        const url = await this.shortService.shortenUrl(
            originalUrl,
            {
                sub: req?.user?.sub,
                client_id: req?.user?.client_id,
            });

        return res.status(HttpStatus.CREATED).send({ status: HttpStatus.CREATED, msg: url });
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Edit an existing shortened URL' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: UrlEntity,
        description: 'Updates the original URL for the specified shortened URL ID',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'URL not found or does not belong to the authenticated user',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Unauthorized to edit this URL',
    })
    @UseGuards(TokenGuard)
    @Patch('/:id')
    edit(@Req() req: RequestWithUser, @Param() { id }: UrlIdDto, @Body() { originalUrl }: EditOriginalUrlDto) {
        return this.shortService.urlRepository.update({
            data: { originalUrl },
            compositeId: {
                id,
                userId: req.user.sub,
                clientId: req.user.client_id,
            },
        });
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a shortened URL' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: UrlEntity,
        description: 'Marks the specified shortened URL as deleted',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'URL not found or does not belong to the authenticated user',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Unauthorized to delete this URL',
    })
    @UseGuards(TokenGuard)
    @Delete('/:id')
    async destroy(@Req() req: RequestWithUser, @Param() { id }: UrlIdDto) {
        const deleted = await this.shortService.urlRepository.update({
            data: { deletedAt: new Date() },
            compositeId: {
                id,
                userId: req.user.sub,
                clientId: req.user.client_id,
            },
        });
        return deleted;
    }
}
