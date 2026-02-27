/**
 * Common Types
 */
import { createContext } from '@lit/context';
import type { HomeAssistant } from 'custom-card-helpers';

export * from './style-preset';
export * from './home-assistant';
export type { CSSUnit } from './css-units';

export const hassContext = createContext<HomeAssistant>('hass');
