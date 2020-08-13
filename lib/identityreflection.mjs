/**
 * This is a reflection of a distributed identity which
 * resides in universe matter
 *
 * @author: blukassen
 */

import { Reporter }                 from "/evolux.supervise";
import { EventEmitter }             from "/evolux.pubsub";

const features = ['matter', 'attests'];

export default class IdentityReflection extends Reporter(EventEmitter) {

    constructor({
                    did,            // distributed identifier
                    anchor,         // this is a reference to the real identity (e.g. a gun User) wrapped by this reflection
                    // pair         // keypair must be supplied at a lower level
                } = {}) {
        super();
        Object.assign(this, { did, anchor });
    }

    get isIdentity() {
        return true;
    }

    static availableFeatures() {
        return features.toEnum();
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
            delete this.anchor;
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

    supports(feature) {
        return !!features.find(item => item === feature);
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
     * get a key for a member (the identity) which can only
     * be generates by either this identity or the owner (of the other keypair).
     *
     * use to avoid tracking of members
     *
     * @param identity
     * @param salt
     * @return {Promise<string>}    secret hash
     */
    async sharedIdHashWith(identity, salt) {
        let secret = await this.sharedSecret(identity.epub);
        let hash = await everblack.work(`${this.pub}|${secret}`, salt);
        hash = `@${hash.replace(/[=]/g, '')}`;
        return hash;
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
