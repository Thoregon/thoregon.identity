/**
 * This is a reflection of a distributed identity which
 * resides in universe matter
 *
 * @author: blukassen
 */

import { Reporter }                 from "/evolux.supervise";
import { EventEmitter }             from "/evolux.pubsub";

export default class IdentityReflection extends Reporter(EventEmitter) {

    constructor({
                    did,            // distributed identifier
                    anchor,         // this is a reference to the real identity (e.g. a gun User) wrapped by this reflection
                    // pair         // keypair must be supplied at a lower level
                } = {}) {
        super();
        Object.assign(this, { did, anchor });
    }

    get root() {
        return this.anchor ? this.anchor.root : undefined;
    }

    prettyprint() {
        return this.anchor ? this.anchor.prettyprint() : '<unknown>';
    }

    /**
     * get a derived DID for a service.
     * Each service gets its own DID to prevent traceability across service
     */
    derivedDID(serviceid) {

    }

    async leave() {
        if (this.anchor) {
            await this.anchor.leave();
            delete universe.identity;
            this.emit('leave', { identity: this });
        }
    }

    get is() {
        return this.anchor ? this.anchor.is : false;
    }

    get alias() {
        return this.anchor.alias;
    }

    get matter() {
        return this.anchor.matter;
    }

    /*
     * keys
     */

    get pub() {
        return this.anchor.pub;
    }

    get epub() {
        return this.anchor.epub;
    }

    /**
     * provide a public key to get a shared secret with this identity
     * @param epub - encryption public key
     */
    async sharedSecret(epub) {
        return this.anchor.sharedSecret(epub);
    }

    /**
     * signon on local peer
     */
    recall() {

    }


    /**
     * verifiable claims
     */

    attestVerifiableClaim(id, verifiableClaim) {
        if (!this.is) throw ErrNotAuthenticated();
        let root = this.getRoot();
        if (root) {
            let verifiableClaims = root.verifiableClaims[id];   // gets the claims for the specified id. will be created if missing
            verifiableClaim.add(verifiableClaim);
        }
    }

    /*
     * Persitence
     */

    get root() {
        return  this.anchor
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            leave:          'identity has logged out',
        };
    }
}
