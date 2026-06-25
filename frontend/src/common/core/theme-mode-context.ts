import { createContext } from '@lit/context';
import type { ThemeModeSelection } from '@/common/types/style-preset';

export const themeModeContext = createContext<ThemeModeSelection>('theme-mode');
