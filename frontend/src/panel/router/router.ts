/**
 * Simple router for Card Builder panel
 */

export const BASE_PATH = 'card-builder'

export const ROUTES = {
    DASHBOARD: 'dashboard',
    CARDS: 'cards',
    EDITOR_CREATE: 'editor/create',
    EDITOR_EDIT: 'editor/edit',
} as const;

export type RouteId = typeof ROUTES[keyof typeof ROUTES];

export interface RouteChangeEvent extends Event {
    detail: {
        route: string;
        params: Record<string, string>;
    };
}

/**
 * Router class for managing navigation in the Card Builder panel
 */
export class Router extends EventTarget {
    private currentRoute: string = ROUTES.DASHBOARD;
    private currentParams: Record<string, string> = {};

    constructor() {
        super();
        this._initialize();
    }

    /**
     * Navigate to a route
     */
    navigate(route: string, params?: Record<string, string>): void {
        this.currentRoute = route;
        this.currentParams = params || {};

        // Build full URL path
        const fullPath = `/${BASE_PATH}/${route}${params ? '?' + new URLSearchParams(params).toString() : ''}`;

        // Update URL using History API
        window.history.pushState({route, params}, '', fullPath);

        // Emit route-changed event
        this.dispatchEvent(new CustomEvent('route-changed', {
            detail: {
                route: this.currentRoute,
                params: this.currentParams,
            },
        }));
    }

    /**
     * Get current route and params
     */
    getCurrentRoute(): { route: string; params: Record<string, string> } {
        return {
            route: this.currentRoute,
            params: {...this.currentParams},
        };
    }

    /**
     * Parse route from path string
     */
    parseRoute(path: string, search: string  = ''): { route: string; params: Record<string, string> } {
        // Remove base path if present
        let cleanPath = path.startsWith('/') ? path.substring(1) : path;
        if (cleanPath.startsWith(BASE_PATH)) {
            cleanPath = cleanPath.substring(BASE_PATH.length);
        }

        // Remove leading slash
        cleanPath = cleanPath.replace(/^\/+/, '');

        // If empty, return dashboard
        if (!cleanPath) {
            return {
                route: ROUTES.DASHBOARD,
                params: {},
            };
        }

        const params = new URLSearchParams(search);

        // Check for exact matches
        const routeValues = Object.values(ROUTES);
        for (const route of routeValues) {
            if (cleanPath === route) {
                return {
                    route,
                    params: Object.fromEntries(params),
                };
            }
        }

        // Default to dashboard
        return {
            route: ROUTES.DASHBOARD,
            params: {},
        };
    }

    private _initialize(): void {
        // Listen to popstate for browser back/forward
        window.addEventListener('popstate', (e: PopStateEvent) => {
            this._handleLocationChange(e);
        });

        // Parse initial route
        this._handleLocationChange();
    }

    private _handleLocationChange(e?: PopStateEvent): void {
        const pathname = window.location.pathname;
        const parsed = this.parseRoute(pathname, window.location.search);

        if (this._routesAreEqual(this.currentRoute, this.currentParams, e?.state.route ?? '', e?.state.params ?? {})) {
            return;
        }

        this.currentRoute = parsed.route;
        this.currentParams = parsed.params;

        this.dispatchEvent(new CustomEvent('route-changed', {
            detail: {
                route: this.currentRoute,
                params: this.currentParams,
            },
        }));
    }

    private _routesAreEqual(route1: string, params1: Record<string, string>, route2: string, params2: Record<string, string>): boolean {
        return route1 === route2 && this._routesParamsAreEqual(params1, params2);
    }

    private _routesParamsAreEqual(params1: Record<string, any>, params2: Record<string, any>): boolean {
        if (params1 === params2) return true;

        if (typeof params1 !== "object" || typeof params2 !== "object" || params1 == null || params2 == null) {
            return false;
        }

        const keys1 = Object.keys(params1);
        const keys2 = Object.keys(params2);

        if (keys1.length !== keys2.length) return false;

        return keys1.every(key =>
            keys2.includes(key) &&
            this._routesParamsAreEqual(params1[key], params2[key])
        );
    }
}

// Singleton instance
let routerInstance: Router | null = null;

export function getRouter(): Router {
    if (!routerInstance) {
        routerInstance = new Router();
    }
    return routerInstance;
}
