/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Proof {

    constructor({ creator, created, type, nounce, signature } = {}) {
        this.creator   = creator;
        this.created   = created;
        this.type      = type;      // kind of cryptographic signature
        this.nounce    = nounce;    // salt
        this.signature = signature;
    }

}
