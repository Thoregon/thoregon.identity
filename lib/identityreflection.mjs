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
 *   mey      ... identity reflection if authenticated
 *
 * todo: pulgins for other self souvereign identity systems
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }      from '/evolux.universe';
import { EventEmitter } from "/evolux.pubsub";
import { Reporter }     from "/evolux.supervise";
import Facade           from "/thoregon.crystalline/lib/facade.mjs";
import WorkerProvider   from "/thoregon.crystalline/lib/providers/workerprovider.mjs";
import Identity         from "./identity.mjs";

let SSIRESOLVER;

export default class IdentityReflection extends Reporter(EventEmitter) {

    constructor(props) {
        super(props);
    }

    /*
     * API
     */

    /**
     * create a user with a password
     *
     * @param password
     * @return {Promise<void>}
     */
    async create(password) {
        await this.connectSE();
        return await this.identity.create(password);
    }

    /**
     * authenticate and signon user with its password
     *
     * @param password
     * @return {Promise<void>}
     */
    async auth(password) {
        return await this.signon(password);
    }

    async signon(password) {
        await this.connectSE();
        await this.identity.signon(password);
        me.establish();
        return true;
    }

    async delete(password) {
        await this.connectSE();
        return await this.identity.delete(password);
    }

    /**
     * find a user in contacts
     *
     * @param idhandle
     * @return {Promise<*>}
     */
    async find(idhandle) {
        // todo
    }

    /**
     * is a user currently signed on
     * @return {Promise<void>}
     */
    get is() {
        return  globalThis.me?.is;
    }

    async saveIdentity() {
        await this.connectSE();
        return me;
    }

    /*
     * Consts
     */

    /*
     * Internal
     */

    hasLeft(identity) {
        this.emit('leave', identity);
    }

    async connectSE() {
        if (this.identity) return;
        // create facade to the shared worker encapsulating private information
        // check if there is a session with an identity and use it
        // otherwise create a ghost identity
        try {
            let SE  = await Facade.use(await WorkerProvider.from('/thoregon.identity/lib/identitysecret.mjs'));
            this.identity = SE;

            // listen to all events
            SE.subscribe('signon', () => this.signedon(SE));
            SE.subscribe('signoff', () => this.hasLeft(SE));
            SE.subscribe('created', () => this.identityCreated());
            SE.subscribe('deleted', () => this.identityDeleted());
            // create:
            //  - me
            let identity      = new Identity({ SE }); // create an identity
            // universe.me       = identity;
            universe.global('me', identity);              // caution: can't be changed later. secure all methods by checking if user is signed on
        } catch (e) {
            this.logger.error('No SE interface', e);
        }
    }

    signedon() {
        // connect all identity properties with persistent items
        // connect
        // me.establish(); // already done
        this.emit('auth', me);
    }

    identityCreated() {
        this.emit('identity created');
    }

    identityDeleted() {
        this.emit('identity deleted');
    }

    get SSIResolver() {
        return SSIRESOLVER;
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
    async init() {
        await this.connectSE();
        SSIRESOLVER = (await import(universe.SSI_RESOLVER)).default;
    }

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
