import { css, svg, type SVGTemplateResult } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { LinkAnimationBase, type LinkAnimationContext, type LinkAnimationPanelConfig, type LinkAnimationPropResolver } from './link-animation-base';

const DEFAULT_PARTICLE_SIZE = 10;

export interface ParticleAnimationConfig {
    particleSize?: number;
}

type ParticleAnimationContext = LinkAnimationContext<ParticleAnimationConfig>;

export class ParticleAnimation extends LinkAnimationBase<ParticleAnimationConfig> {
    private particleRef = createRef<SVGCircleElement>();

    getDefaultStyle() {
        return css`
            .link-flow-particle {
                fill: var(--link-flow-color);
                stroke: none;
                stroke-width: 0;
                opacity: 1;
                filter: none;
                offset-rotate: auto;
                pointer-events: none;
            }
        `;
    }

    getPanelConfig(): LinkAnimationPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'particle-animation',
                        label: 'Particle',
                        traits: [
                            {
                                type: 'number',
                                name: 'particleSize',
                                label: 'Particle Size',
                                min: 1,
                                max: 48,
                                step: 1,
                                description: 'Overrides the particle size when set.'
                            },
                        ],
                    },
                ],
            },
            targetStyles: {
                particle: {
                    label: 'Particle',
                    description: 'Animated particle style',
                    styles: {
                        groups: ['svg'],
                        properties: [
                            'effects.opacity',
                            'effects.filter',
                        ],
                    },
                },
            },
        };
    }

    getResolvedProps(resolver: LinkAnimationPropResolver): Record<string, unknown> {
        return {
            particleSize: resolver.resolveNumber('particleSize', 0),
        };
    }

    render(ctx: ParticleAnimationContext): SVGTemplateResult {
        const motionStyle: Record<string, string> = {
            offsetPath: `path('${ctx.path}')`,
        };

        const {style, radius} = this.buildParticleStyle(ctx);

        return svg`
            <g class="link-particle-layer">
                <circle
                    class="link-flow-particle"
                    r=${radius}
                    ${ref(this.particleRef)}
                    style=${styleMap({...style, ...motionStyle})}
                ></circle>
            </g>
        `;
    }

    protected createAnimations(_ctx: ParticleAnimationContext): Animation[] {
        const particle = this.particleRef.value;
        if (!particle) return [];

        return [
            particle.animate([{offsetDistance: '0%'}, {offsetDistance: '100%'}], {
                duration: this.baseDuration,
                iterations: this.iterations,
                easing: 'linear',
            }),
        ];
    }

    protected shouldRebuild(_ctx: ParticleAnimationContext): boolean {
        const particle = this.particleRef.value;
        if (!particle) return true;
        if (this.animations.length !== 1) return true;
        return (this.animations[0].effect as KeyframeEffect)?.target !== particle;
    }

    private buildParticleStyle(ctx: ParticleAnimationContext): { style: Record<string, string>; radius: number } {
        const style = ctx.animationStyles?.particle || {};
        const sizeOverride = this.parseSize(ctx.animationConfig?.particleSize, 0);
        const sizeValue = sizeOverride > 0 ? sizeOverride : DEFAULT_PARTICLE_SIZE;
        const size = this.parseSize(sizeValue, DEFAULT_PARTICLE_SIZE);
        const radius = Math.max(1, size / 2);

        return {
            style,
            radius,
        };
    }
}
