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
        universe.$Identity = this;
        if (universe.ssi) return await this.hostedSSI(universe.ssi);
        this.restoreSSI();
    }

    async stop() {

    }

    async restoreSSI() {
        const Identity = await this.getIdentiyClass();
        const identity = await Identity.restore();
        if (!identity) return null;
        universe.global('me', identity);
        return identity;
    }

    async signon(credentials) {
        const Identity = await this.getIdentiyClass();
        let identity   = new Identity(credentials); // create an identity
        universe.global('me', identity);
        await identity.store();
        return identity;
    }

    async hostedSSI(credentials) {
        if (globalThis.me) return;
        const Identity = await this.getIdentiyClass();
        let identity   = new Identity(credentials); // create an identity
        universe.global('me', identity);
        // await identity.store(); !! don't store a test identity
        return identity;
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