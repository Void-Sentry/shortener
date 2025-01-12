import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { verify } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export type RequestWithUser = FastifyRequest & { user: any };

@Injectable()
export class AuthGuard implements CanActivate {
    private client = jwksClient({
        jwksUri: process.env.JWKS_URI,
        requestHeaders: {
            "Host": process.env.EXTERNAL_DOMAIN
        }
    });

    readonly #getKey = (header: any, callback: (err: any, key: any) => void) =>
        this.client.getSigningKey(header.kid, (err, key) => {
            if (err) return callback(err, null);

            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        });

    readonly #validateToken = (token: string) =>
        new Promise<any>((resolve, reject) => {
            verify(token, this.#getKey.bind(this), {}, (err, decoded) => {
                if (err) return reject(err);
                resolve(decoded);
            });
        });


    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader)
            return true;

        const token = authHeader.split(' ')[1];

        if (!token)
            throw new UnauthorizedException("Token not found in Authorization header.");

        try {
            const decoded = await this.#validateToken(token);
            request.user = decoded;
            return !!decoded;
        } catch (error) {
            throw new UnauthorizedException("Invalid token.");
        }
    }
}
