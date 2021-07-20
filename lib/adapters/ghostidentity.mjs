/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { IdentityShim }          from "/evolux.everblack";
import { ErrCantCreateIdentity } from "../errors.mjs";

export default class GhostIdentity {

    static async use() {
        // always use a handle (worker) from Everblack, never expose any keys!
/*
        let kp = localStorage.getItem("tkp");
        if (!kp) {
            kp = await universe.Everblack.pair();
            localStorage.setItem("tkp", JSON.stringify(kp));
        } else {
            kp = JSON.parse(kp);
        }

        soleInstance.shim = new IdentityShim(kp);
*/
        return soleInstance;
    }

    get is() {
        return true;
    }

    get alias() {
        return 'Temp_Identiy';
    }

    /*
    * protocoll to work with identities
    */
    isGhost() {
        return true;
    }

    /*
     * Keys stored in localStore
     * This can only be temporarly!
     */

    get pub() {
        return this.shim.pub;
    }

    get epub() {
        return this.shim.epub;
    }

    /**
     * provide a public key to get a shared secret with this identity
     * @param epub - encryption public key
     */
    async sharedSecret(epub) {
        // todo [REFACTOR]: the keypair from the user will not be accessible in future; must be moved to a secure section, better to a SE (secure element)
        return this.shim.sharedSecret(epub);
    }

    async sign(payload) {
        let signed = await this.shim.sign(payload);
        return signed;
    }

    async verify(payload) {
        let verified = await this.shim.verify(payload);
        return verified;
    }
}

let soleInstance = new GhostIdentity();
