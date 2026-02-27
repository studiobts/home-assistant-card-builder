import type { AnchorPoint, UnitSystem } from '@/common/blocks/core/renderer';
import { css, html } from 'lit';

export interface PositionGuidesState {
    axisX: number;
    axisY: number;
    blockOriginX: number;
    blockOriginY: number;
    unitSystem: UnitSystem;
    xValue: number;
    yValue: number;
}

export interface PositionGuidesElements {
    root: HTMLElement;
    axisDot: HTMLElement;
    axisX: HTMLElement;
    axisY: HTMLElement;
    originDot: HTMLElement;
    lineH: HTMLElement;
    lineV: HTMLElement;
    labelH: HTMLElement;
    labelV: HTMLElement;
}

export const positionGuidesStyles = css`
    .guides {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
    }

    .guides-axis-dot,
    .guides-origin-dot {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(212, 70, 0, 0.95);
        border: 2px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        transform: translate(-50%, -50%);
    }

    .guides-axis {
        position: absolute;
        background: transparent;
        opacity: 0.55;
    }

    .guides-axis.x {
        left: 0;
        right: 0;
        height: 2px;
        border-top: 2px dashed rgba(212, 28, 0, 0.55);
    }

    .guides-axis.y {
        top: 0;
        bottom: 0;
        width: 2px;
        border-left: 2px dashed rgba(212, 28, 0, 0.55);
    }

    .guides-line {
        position: absolute;
        border-color: rgba(212, 28, 0, 0.55);
        border-style: dashed;
        border-width: 0;
    }

    .guides-line.h {
        border-top-width: 1px;
    }

    .guides-line.v {
        border-left-width: 1px;
    }

    .guides-label {
        position: absolute;
        transform: translate(-50%, -50%);
        font-size: 10px;
        line-height: 1;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgb(197, 74, 55);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.18);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }

    .guides[hidden] {
        display: none;
    }
`;

export function renderPositionGuides() {
    return html`
        <div class="guides" hidden>
            <div class="guides-axis-dot"></div>
            <div class="guides-axis x"></div>
            <div class="guides-axis y"></div>
            <div class="guides-origin-dot"></div>
            <div class="guides-line h"></div>
            <div class="guides-line v"></div>
            <div class="guides-label h"></div>
            <div class="guides-label v"></div>
        </div>
    `;
}

export function getAxisCoordinates(anchorPoint: AnchorPoint, canvasWidth: number, canvasHeight: number) {
    const axisX = anchorPoint.includes('right') ? canvasWidth : anchorPoint.includes('center') ? canvasWidth / 2 : 0;
    const axisY = anchorPoint.includes('bottom') ? canvasHeight : anchorPoint.includes('middle') ? canvasHeight / 2 : 0;

    return {axisX, axisY};
}

export function getLocalOriginOnElement(
    originPointOnElement: AnchorPoint,
    elementWidth: number,
    elementHeight: number,
) {
    const localOriginX = originPointOnElement.includes('right')
        ? elementWidth
        : originPointOnElement.includes('center')
            ? elementWidth / 2
            : 0;

    const localOriginY = originPointOnElement.includes('bottom')
        ? elementHeight
        : originPointOnElement.includes('middle')
            ? elementHeight / 2
            : 0;

    return {localOriginX, localOriginY};
}

export function formatDistance(value: number, unitSystem: UnitSystem): string {
    if (unitSystem === '%') {
        const rounded = Math.round(value * 100) / 100;
        return `${rounded}%`;
    }

    return `${Math.round(value)}px`;
}

export function ensurePositionGuidesElements(root: ShadowRoot | null): PositionGuidesElements | null {
    const overlay = root?.querySelector<HTMLElement>('.guides');
    if (!overlay) return null;

    const axisDot = overlay.querySelector<HTMLElement>('.guides-axis-dot');
    const axisX = overlay.querySelector<HTMLElement>('.guides-axis.x');
    const axisY = overlay.querySelector<HTMLElement>('.guides-axis.y');
    const originDot = overlay.querySelector<HTMLElement>('.guides-origin-dot');
    const lineH = overlay.querySelector<HTMLElement>('.guides-line.h');
    const lineV = overlay.querySelector<HTMLElement>('.guides-line.v');
    const labelH = overlay.querySelector<HTMLElement>('.guides-label.h');
    const labelV = overlay.querySelector<HTMLElement>('.guides-label.v');

    if (!axisDot || !axisX || !axisY || !originDot || !lineH || !lineV || !labelH || !labelV) return null;

    return {
        root: overlay,
        axisDot,
        axisX,
        axisY,
        originDot,
        lineH,
        lineV,
        labelH,
        labelV,
    };
}

export function hidePositionGuides(elements: PositionGuidesElements | null): void {
    if (!elements) return;
    elements.root.setAttribute('hidden', '');
}

export function updatePositionGuides(
    elements: PositionGuidesElements | null,
    data: PositionGuidesState | null,
    canvasWidth: number,
    canvasHeight: number,
): void {
    if (!elements) return;

    if (!data) {
        hidePositionGuides(elements);
        return;
    }

    elements.root.removeAttribute('hidden');

    elements.axisDot.style.top = `calc(${data.axisY}px)`;
    elements.axisDot.style.left = `calc(${data.axisX}px)`;
    elements.axisX.style.top = `calc(${data.axisY}px - 2px)`;
    elements.axisY.style.left = `calc(${data.axisX}px - 2px)`;

    elements.originDot.style.left = `${data.blockOriginX}px`;
    elements.originDot.style.top = `${data.blockOriginY}px`;

    const hY = data.blockOriginY;
    const hX1 = Math.min(data.blockOriginX, data.axisX);
    const hX2 = Math.max(data.blockOriginX, data.axisX);
    elements.lineH.style.top = `${hY}px`;
    elements.lineH.style.left = `${hX1}px`;
    elements.lineH.style.width = `${Math.max(0, hX2 - hX1)}px`;

    const vX = data.blockOriginX;
    const vY1 = Math.min(data.blockOriginY, data.axisY);
    const vY2 = Math.max(data.blockOriginY, data.axisY);
    elements.lineV.style.left = `${vX}px`;
    elements.lineV.style.top = `${vY1}px`;
    elements.lineV.style.height = `${Math.max(0, vY2 - vY1)}px`;

    const hMidX = (hX1 + hX2) / 2;
    elements.labelH.textContent = formatDistance(data.xValue, data.unitSystem);

    const vMidY = (vY1 + vY2) / 2;
    elements.labelV.textContent = formatDistance(data.yValue, data.unitSystem);

    const padding = 10;
    const clamp = (value: number, max: number) => Math.max(padding, Math.min(value, max - padding));

    elements.labelH.style.left = `${clamp(hMidX, canvasWidth)}px`;
    elements.labelH.style.top = `${clamp(hY, canvasHeight)}px`;

    elements.labelV.style.left = `${clamp(vX, canvasWidth)}px`;
    elements.labelV.style.top = `${clamp(vMidY, canvasHeight)}px`;
}
