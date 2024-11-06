import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TokenGuard implements CanActivate {
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        return request?.user?.sub && request?.user?.client_id;
    }
}
