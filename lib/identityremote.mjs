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

    constructor(...args) {
        // super(...args);
        Object.assign(this, args);
    }

    async store() {
        const data = { ...this };
        await baseDB.set('identity', data);
    }

    static async restore() {
        const data = await baseDB.get('identity');
        return data ? new this(data) : null;
    }
}