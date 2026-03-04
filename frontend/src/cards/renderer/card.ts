import '@/common/blocks/loader';
import '@/cards/renderer/card-renderer';
import '@/cards/renderer/card-renderer-editor';
import { CARD_BUILDER_VERSION} from "@/common/version";
import { CARD_INFO } from "@/cards/renderer/card-info";

console.info(
    `%c ${CARD_INFO.name} %c v${CARD_BUILDER_VERSION}`,
    `background: ${CARD_INFO.bgLeft}; color: ${CARD_INFO.colorLeft}; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;`,
    `background: ${CARD_INFO.bgRight}; color: ${CARD_INFO.colorRight}; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;`
);

import { cardRendererComponentsRegistry } from '@/cards/renderer/registry';
cardRendererComponentsRegistry.boot();