import type { BlockPropertyConfig } from '@/common/blocks/core/properties';
import type { BlockPanelTargetStyles } from '@/common/blocks/types';
import type { CSSResult, SVGTemplateResult } from 'lit';

export type LinkFlowDirection = 'forward' | 'reverse';

export type LinkAnimationContextConfig = Record<string, any>;

export type LinkAnimationContext<T> = {
    blockId: string;
    path: string;
    pathLength: number;
    flowEnabled: boolean;
    speedValue: number;
    flowDirectionPositive: LinkFlowDirection;
    animationStyles: Record<string, Record<string, string>>;
    animationConfig: T;
};

export type LinkAnimationPanelConfig = {
    properties?: BlockPropertyConfig;
    targetStyles?: BlockPanelTargetStyles;
};

export type LinkAnimationPropResolver = {
    resolveString: (name: string, fallback?: string) => string;
    resolveNumber: (name: string, fallback: number) => number;
    resolveBoolean: (name: string, fallback?: boolean) => boolean;
};

export abstract class LinkAnimationBase<T> {
    protected animations: Animation[] = [];
    protected readonly baseDuration = 1000;
    protected readonly iterations = 1_000_000_000;

    private lastRate: number | null = null;
    private lastActive: boolean | null = null;
    protected lastConfigKey: string | null = null;

    abstract render(ctx: LinkAnimationContext<T>): SVGTemplateResult;
    abstract getDefaultStyle(): CSSResult | null;

    getPanelConfig(): LinkAnimationPanelConfig {
        return {};
    }

    getResolvedProps(_resolver: LinkAnimationPropResolver): Record<string, unknown> {
        return {};
    }

    update(ctx: LinkAnimationContext<T>): void {
        this.ensureAnimations(ctx);
        if (!this.animations.length) return;

        const {active, playbackRate} = this.computePlayback(ctx);
        if (!active) {
            if (this.lastActive !== false) {
                this.animations.forEach((animation) => animation.pause());
                this.lastActive = false;
            }
            return;
        }

        const rateChanged = this.lastRate === null || Math.abs(playbackRate - this.lastRate) > 1e-6;
        if (rateChanged) {
            this.applyPlayback(playbackRate);
            this.lastRate = playbackRate;
        }

        if (this.lastActive !== true) {
            this.startFromEdge(playbackRate);
            this.lastActive = true;
        }
    }

    destroy(): void {
        this.resetAnimations();
    }

    protected computePlayback(ctx: LinkAnimationContext<T>): {
        active: boolean;
        playbackRate: number;
    } {
        const speedMagnitude = Math.abs(ctx.speedValue);
        const active = ctx.flowEnabled && speedMagnitude > 0 && ctx.pathLength > 0;
        if (!active) {
            return {active: false, playbackRate: 0};
        }

        const directionFactor = ctx.flowDirectionPositive === 'reverse' ? -1 : 1;
        const signedDirection = (ctx.speedValue < 0 ? -1 : 1) * directionFactor;
        const rateMagnitude = speedMagnitude / ctx.pathLength;
        return {active: true, playbackRate: rateMagnitude * signedDirection};
    }

    protected applyPlayback(playbackRate: number): void {
        this.animations.forEach((animation) => {
            animation.playbackRate = playbackRate;
        });
    }

    protected startFromEdge(playbackRate: number): void {
        this.animations.forEach((animation) => {
            if (animation.currentTime === null) {
                const timing = animation.effect?.getTiming();
                const base = typeof timing?.duration === 'number' ? timing.duration : this.baseDuration;
                animation.currentTime = playbackRate < 0 ? base : 0;
            }
            animation.play();
        });
    }

    protected ensureAnimations(ctx: LinkAnimationContext<T>): void {
        const configKey = this.getConfigKey(ctx);
        const needsRebuild =
            !this.animations.length ||
            this.shouldRebuild(ctx) ||
            (configKey !== null && configKey !== this.lastConfigKey);

        if (!needsRebuild) return;

        this.resetAnimations();
        const created = this.createAnimations(ctx);
        if (created.length) {
            this.animations = created;
            this.lastConfigKey = configKey;
        }
    }

    protected resetAnimations(): void {
        this.animations.forEach((animation) => animation.cancel());
        this.animations = [];
        this.lastRate = null;
        this.lastActive = null;
        this.lastConfigKey = null;
    }

    protected parseSize(value: string | number | undefined, fallback: number): number {
        if (typeof value === 'number') return value;
        if (!value) return fallback;
        const parsed = parseFloat(value);
        if (Number.isNaN(parsed)) return fallback;
        return parsed;
    }

    protected getConfigKey(_ctx: LinkAnimationContext<T>): string | null {
        return null;
    }

    protected shouldRebuild(_ctx: LinkAnimationContext<T>): boolean {
        return false;
    }

    protected abstract createAnimations(ctx: LinkAnimationContext<T>): Animation[];
}