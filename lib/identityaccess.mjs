/**
 * The Identity Controller provides an API to create and authenticate identities,
 * and it also provides a reflection if there is an identity authenticated
 *
 * This class is named controller, not repository, Because it does not provide its own collection
 * It uses the underlying distributed identities and provides an API
 *
 * start
 *  - check if there is a 2FA device available
 *    - todo: signon with 2FA
 *      - may also be an app e.g. Google authenticator
 *    -
 *    - SSI settings are encrypted in matter
 *
 *   universe.Identity      ... controller
 *   universe.identity      ... identity reflection if authenticated
 *
 * todo: pulgins for other self souvereign identity systems
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }        from '/evolux.universe';

import { EventEmitter}    from "/evolux.pubsub";
import { Reporter }       from "/evolux.supervise";

import GunIdentity        from "./adapters/gunidentity.mjs";
import IdentityReflection from "./identityreflection.mjs";
// import GhostIdentity      from "./adapters/ghostidentity.mjs";

const IdAdapter = GunIdentity;  // todo: introduce convention/configuration

const IDENTITY_SCHEMA = {
    meta: {
        "name"       : "ThoregonIdentity",
        "version"    : "1.0.0",
        "description": "A thoregon identity enables self sovereignty",
        "persistence": "immediate"
    },
    attributes: {
        "keyref": { type: 'string' },
        "nickname": { type: 'string' },
        "claims": { type: 'directory' },
        "grants": { type: 'directory' },
        "galaxies": { type: 'directory' },
        "devices": { type: 'directory' },
        "repos": { type: 'directory' },
    }
}

export default class IdentityAccess extends Reporter(EventEmitter) {

    constructor(props) {
        super(props);
        // IdAdapter.init();
        // IdAdapter.addListener((anchor) => this.signedon(anchor));
    }

    /*
     * API
     */

    /**
     * create a user with an alias and a passphrase
     *
     * @param alias
     * @param passphrase
     * @return {Promise<void>}
     */
    async create(alias, passphrase) {
        // await IdAdapter.create(alias, passphrase);
        this.emit('created', { alias });
    }

    /**
     * authenticate and signon user with its alias and passphrase
     *
     * @param alias
     * @param passphrase
     * @return {Promise<void>}
     */
    async auth(alias, passphrase) {
        // await IdAdapter.auth(alias, passphrase);
    }

    /**
     * signon an identity. the key pairs must be known in this case.
     * use for testing or very secure environments only
     *
     * @param {Object} credentials
     * @return {Promise<void>}
     */
    async signon(credentials) {

    }



    /**
     * find a user by its alias or its public key
     *
     * @param apubkeyoralias
     * @return {Promise<*>}
     */
    async find(apubkeyoralias) {
        return await IdAdapter.find(apubkeyoralias);
    }

    /**
     * is a user currently signed on
     * @return {Promise<void>}
     */
    get is() {
        return !!universe.identity;
    }

    async saveIdentity() {
        universe.identity;
    }

    /*
     * Consts
     */

    get IdentityReflection() {
        return IdentityReflection;
    }

    /*
     * Internal
     */

    hasLeft(identity) {
        this.emit('leave', identity);
    }

    init() {
        // create facade to the shared worker encapsulating private information

        // check if there is a session with an identity and use it
        // otherwise create a ghost identity
        let identity = new IdentityReflection();

        this.identity = identity;
/*
        let user = universe.matter.user();
        this.handler = user;
        if (!!user.is) this.signon(user);
*/
    }

    signedon(anchor) {
        universe.logger.info("[Identity] -> signon");
        // create:
        //  - universe.me
        //  - me
        let identity = this.identity; // new IdentityReflection({ anchor: anchor });
        universe.me = identity;
        Object.defineProperty(globalThis, 'me', {
            configurable: false,
            enumerable  : true,
            writable    : false,
            value       : identity
        })
        // create an identity reflection
        universe.identity = identity;       // todo [DEPRECIATED]: replace in code
        universe.me = identity;
        universe.global('me');

        this.emit('auth', identity);
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'Identity controller ready',
            exit:           'Identity controller exit',
            created:        'an identity was created',
            auth:           'an identity has authenticated',
            leave:          'an identity has logged out',
            delete:         'an identity has been deleted'
        };
    }

    /*
     * service implementation
     */

    install() {}
    uninstall() {}
    resolve() {}
    start() {
        this.init();
        universe.Identity = this;   // publish identity controller
        this.emit('ready', { identitycontroller: this });
    }
    stop() {
        if (this.serviceproviderwebservice) this.serviceproviderwebservice.stop();

        delete universe.Identity;
        this.emit('exit', { identitycontroller: this });
    }

    update() {}

}
