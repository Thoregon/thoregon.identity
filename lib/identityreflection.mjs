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
                    pair            // a keypair if supplied
                } = {}) {
        super();
        Object.assign(this, { did, pair, anchor });
    }

    get root() {
        return this.anchor ? the.anchor.root : undefined;
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
        if (this.anchor) await this.anchor.leave();
    }

    get is() {
        return this.anchor ? this.anchor.is : false;
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
}
