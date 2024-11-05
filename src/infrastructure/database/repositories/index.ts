import { clickRepository } from "./click.repository";
import { urlRepository } from "./url.repository";

export const repositories = [
    ...clickRepository,
    ...urlRepository,
];