/**
 * The Identity Controller provides an API to create and authenticate identities,
 * and it also provides a reflection if there is an identity authenticated
 *
 * This class is named controller, not repository, Because it does not provide its own collection
 * It uses the underlying distributed identities and provides an API
 *
 *   universe.Identity      ... controller
 *   universe.identity      ... identity reflection if authenticated
 *
 * todo: pulgins for other self souvereign identity systems
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }                  from '/evolux.universe';

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import GunIdentity        from "./adapters/gunidentity.mjs";
import IdentityReflection from "./identityreflection.mjs";
import SaveIdentity       from "./adapters/saveidentity.mjs";

const IdAdapter = GunIdentity;  // todo: introduce convention/configuration

let saveIdentity;

export default class Controller extends Reporter(EventEmitter) {

    constructor(props) {
        super(props);
        IdAdapter.init();
        IdAdapter.addListener((anchor) => this.signedon(anchor));
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
        await IdAdapter.create(alias, passphrase);
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
        await IdAdapter.auth(alias, passphrase);
        await doAsync();
    }

    /**
     * find a user by its alias or its public key
     *
     * @param apubkeyoralias
     * @return {Promise<*>}
     */
    async find(apubkeyoralias) {
        return IdAdapter.find(apubkeyoralias);
    }

    /**
     * is a user currently signed on
     * @return {Promise<void>}
     */
    get is() {
        return !!universe.identity;
    }

    async saveIdentity() {
        if (this.is) return universe.identity;

        if (!saveIdentity) {
            saveIdentity = await SaveIdentity.use();
        }

        return saveIdentity;
    }

    /*
     * Internal
     */

    hasLeft(identity) {
        this.emit('leave', identity);
    }

    init() {
/*
        let user = universe.matter.user();
        this.handler = user;
        if (!!user.is) this.signon(user);
*/
    }

    signedon(anchor) {
        universe.logger.info("[Identity] -> signon");
        // create an identity reflection
        let identity = new IdentityReflection({ anchor: anchor });
        universe.identity = identity;
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
