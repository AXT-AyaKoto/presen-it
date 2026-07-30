declare module "virtual:presenit-deck" {
    import type { DeckConfig } from "../types";

    export type DeckClientData = {
        slug: string;
        config: DeckConfig;
        css: string;
        slides: Array<{ html: string; notes: string | null }>;
    };

    export const deck: DeckClientData;
}
