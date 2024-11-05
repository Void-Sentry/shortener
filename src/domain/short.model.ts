import { Injectable } from "@nestjs/common";
import { UrlEntity } from "src/infrastructure/database/entities";

@Injectable()
export class ShortModel {
    readonly #BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    readonly #EXPANSION_THRESHOLD = 0.9;

    readonly #getMaxCodesForDigits = (digits: number): number => (
        Math.pow(this.#BASE62_ALPHABET.length, digits)
    );

    readonly #base62Encode = (num: number): string => {
        let encoded = '';
        const base = this.#BASE62_ALPHABET.length;

        while (num > 0) {
            encoded = this.#BASE62_ALPHABET[num % base] + encoded;
            num = Math.floor(num / base);
        }

        return encoded;
    };

    readonly generateShortUrl = (url: UrlEntity): string => {
        return `${process.env.EXTERNAL_HOST}/${url.shortCode}`;
    };

    readonly generateShortCode = async (urlCount: number): Promise<string> => {
        let digits = 6;
        while (urlCount >= this.#EXPANSION_THRESHOLD * this.#getMaxCodesForDigits(digits)) {
            digits++;
        }

        const id = urlCount + 1;
        const shortCode = this.#base62Encode(id);

        return shortCode.padStart(digits, '0');
    }
}