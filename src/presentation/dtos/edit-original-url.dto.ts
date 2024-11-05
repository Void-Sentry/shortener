import { IsNotEmpty, IsString } from "class-validator";

export class EditOriginalUrlDto {
    @IsString()
    @IsNotEmpty()
    originalUrl: string;
}