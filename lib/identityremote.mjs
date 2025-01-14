/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
// import Identity from "./identity.mjs";

const DBGID = '## Identity';

export default class IdentityRemote /*extends Identity*/ {

    constructor(credentials) {
        // super(...args);
        Object.assign(this, credentials);
    }

    get soul() {
        return this.anchor;
    }

    async store() {
        const data = { ...this };
        await baseDB.set('identity', data);
    }

    static async restore() {
        const data = await baseDB.get('identity');
        return data ? new this(data) : null;
    }

    async signoff() {
        await baseDB.del('identity');
        this.invalid = true;
    }

    static async signoff() {
        if (!globalThis.me) return;
        await baseDB.del('identtiy');
        me.invalid = true;
    }
}