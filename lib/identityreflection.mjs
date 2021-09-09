/**
 * This is a reflection of a distributed identity which
 * resides in universe matter
 *
 * @author: blukassen
 */

import { SharedCrypto }     from "/evolux.everblack";
import { Reporter }         from "/evolux.supervise";
import { EventEmitter }     from "/evolux.pubsub";


const rnd       = universe.random;
const everblack = () => universe.Gun.SEA;

const features = ['matter', 'attests'];

export default class IdentityReflection extends SharedCrypto(Reporter(EventEmitter)) {

    constructor({
                    did,            // distributed identifier
                    anchor,         // this is a reference to the real identity (e.g. a gun User) wrapped by this reflection
                    // pair         // keypair must be supplied at a lower level
                } = {}) {
        super();
        Object.assign(this, { did, anchor });
        this._galxies = [];
    }

    get isIdentity() {
        return true;
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
            universe.Identity.hasLeft(this);
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
     * protocol to work with identities
     */
    isGhost() {
        // todo: refactor reroute to this.anchor.isGhost()
        return !this.anchor.isGhost ? false : this.anchor.isGhost();
    }

    /*
     * main properties
     */

    get galaxies() {
        return this._galaxies;
    }

    /*
     * public keys
     */

    get pub() {
        return this.anchor.pub;
    }

    get epub() {
        return this.anchor.epub;
    }

    async sign(payload) {
        return this.anchor.sign(payload);
    }

    async verify(payload) {
        return this.anchor.verify(payload);
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
