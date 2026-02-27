import '@/common/blocks/loader';
import '@/cards/renderer/card-renderer';
import '@/cards/renderer/card-renderer-editor';
import { CARD_VERSION } from "@/cards/renderer/card-version";

console.info(
    `%c ${CARD_VERSION.name} %c v${CARD_VERSION.version}`,
    `background: ${CARD_VERSION.bgLeft}; color: ${CARD_VERSION.colorLeft}; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;`,
    `background: ${CARD_VERSION.bgRight}; color: ${CARD_VERSION.colorRight}; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;`
);

import { cardRendererComponentsRegistry } from '@/cards/renderer/registry';
cardRendererComponentsRegistry.boot();