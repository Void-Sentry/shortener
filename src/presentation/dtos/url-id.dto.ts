import { IsNotEmpty, IsString } from "class-validator";

export class UrlIdDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}