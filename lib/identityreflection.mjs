/**
 * This is a reflection of a distributed identity which
 * resides in universe matter
 *
 * @author: blukassen
 */


export default class IdentityReflection {

    constructor({
                    handle,
                    gunnode,
                    privateKey,
                    publicKey
                } = {}) {
        Object.assign(this, { handle, gunnode , privateKey, publicKey });
    }

    get usernode() {
        return this._usernode;
    }



}
