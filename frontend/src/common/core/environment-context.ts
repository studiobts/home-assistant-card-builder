import { createContext } from "@lit/context";

export interface EnvironmentContext {
    isBuilder: boolean;
    blocksOutlineEnabled: boolean;
    actionsEnabled: boolean;
}

export const environmentContext = createContext<EnvironmentContext>('environment-context');
