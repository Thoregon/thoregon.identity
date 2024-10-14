/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class IdentityReflectionRemote {

    constructor(...args) {
    }

    async start() {
        if (universe.ssi) return await this.hostedSSI(universe.ssi);
        this.restoreSSI();
    }

    async stop() {

    }

    restoreSSI() {

    }

    async hostedSSI(credentials) {
        if (globalThis.me || this.identity) return;
        const Identity = await this.getIdentiyClass();
        let identity   = new Identity(); // create an identity
        // universe.me       = identity;
        if (!globalThis.SSI) universe.global('SSI', identity);              // caution: can't be changed later. secure all methods by checking if user is signed on
        const ssihandle = {
            soul : credentials.anchor,
            alias: credentials.alias,
            salt : credentials.salt,
            mediathek: globalThis.mediathek
        };
        universe.global('me', ssihandle);
    }


    static async getIdentiyClass() {
        const CLASS_REF = universe.IDENTITY_CLASS ?? '/thoregon.identity/lib/identity.mjs';
        const Module = await import(CLASS_REF);
        const Identity = Module.default;
        return Identity;
    }

    async getIdentiyClass() {
        return this.constructor.getIdentiyClass();
    }
}