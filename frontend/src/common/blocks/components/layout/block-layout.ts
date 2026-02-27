import { BlockBase } from "@/common/blocks/components/block-base";
import type { BlockData } from "@/common/core/model";

export abstract class BlockLayout extends BlockBase {

    protected _getDropZones(): BlockData[] {
        if (!this.block || this.block.children.length === 0) return [];

        return this.block.children.map((child) => this.documentModel.getBlock(child as string)!);
    }

    protected _updateDropZones() {
        const dropZones = this._getDropZones();

        dropZones.forEach((zone) => {
            const element = this.documentModel.getElement(zone.id); // FIXME: we have to unify the interface with a common base, here we need LitElement
            element?.requestUpdate();
        });
    }
}