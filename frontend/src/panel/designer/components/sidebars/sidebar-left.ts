import type { TabConfig } from '@/panel/designer/types.ts';

import './sidebar-tabbed';
import '../panels/panel-blocks';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../panels/panel-layers';

@customElement('sidebar-left')
export class SidebarLeft extends LitElement {

    static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `;

    render() {
        const tabs: TabConfig[] = [
            {
                id: 'blocks',
                label: 'Blocks',
                component: 'panel-blocks',
            },
            {
                id: 'layers',
                label: 'Layers',
                component: 'panel-layers',
            },
        ];

        return html`
      <sidebar-tabbed .tabs=${tabs}></sidebar-tabbed>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sidebar-left': SidebarLeft;
    }
}

