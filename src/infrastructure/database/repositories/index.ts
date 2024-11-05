import { ClickRepository } from "./click.repository";
import { UrlRepository } from "./url.repository";

export * from './click.repository';
export * from './url.repository';

export const repositories = [
    ClickRepository,
    UrlRepository,
];