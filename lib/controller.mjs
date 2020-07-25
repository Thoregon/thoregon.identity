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

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import GunIdentity                  from "./adapters/gunidentity.mjs";
import IdentityReflection           from "./identityreflection.mjs";

const IdAdapter = GunIdentity;  // todo: introduce convention/configuration


export default class Controller extends Reporter(EventEmitter) {

    constructor(props) {
        super(props);
        IdAdapter.init();
        IdAdapter.addListener((anchor) => this.signon(anchor));
    }

    /*
     * API
     */

    async create(alias, passphrase) {
        await IdAdapter.create(alias, passphrase);
    }

    async auth(alias, passphrase) {
        await IdAdapter.auth(alias, passphrase);
    }

    async find(apubkeyoralias) {
        return IdAdapter.find(apubkeyoralias);
    }

    /*
     * Internal
     */

    init() {
/*
        let user = universe.matter.user();
        this.handler = user;
        if (!!user.is) this.signon(user);
*/
    }

    signon(anchor) {
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
