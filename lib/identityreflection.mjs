/**
 * This is a reflection of a distributed identity which
 * resides in universe matter
 *
 * @author: blukassen
 */

export default class IdentityReflection {

    constructor({
                    did,            // distributed identifier
                    anchor,         // this is a reference to the real identity (e.g. a gun User) wrapped by this reflection
                    pair            // a keypair if supplied
                } = {}) {
        Object.assign(this, { did, pair });
        this.anchor = universe.Matter.$access('user', anchor);
    }

    /**
     * get a derived DID for a service.
     * Each service gets its own DID to prevent traceability across service
     */
    derivedDID(serviceid) {

    }

    async auth(passphrase) {
        return await universe.Identity.auth(this, passphrase);
    }

    async leave() {
        return await universe.Identity.leave(this);
    }

    get is() {
        return this.anchor ? this.anchor.is : false;
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
