type Constructor = new (...args: any[]) => HTMLElement;

export class ComponentsRegistry {
    private _registry = new Map<string, Constructor>();
    private _isBooted = false;

    /** Aggiunge un componente alla coda di registrazione */
    public define(tag: string, constructor: Constructor) {
        // Se siamo in modalità Pro e il tag è già presente,
        // lo shadowing o l'ordine di import sovrascriveranno il valore nella Map
        this._registry.set(tag, constructor);

        // Se abbiamo già avviato tutto, registriamo subito (per caricamenti lazy)
        if (this._isBooted) {
            this.registerTag(tag, constructor);
        }
    }

    /** Esegue la registrazione effettiva nel browser */
    public boot() {
        this._isBooted = true;
        this._registry.forEach((constructor, tag) => {
            this.registerTag(tag, constructor);
        });
    }

    private registerTag(tag: string, constructor: Constructor) {
        if (!customElements.get(tag)) {
            customElements.define(tag, constructor);
        }
    }
}