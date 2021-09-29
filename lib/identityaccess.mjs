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

import { EventEmitter }   from "/evolux.pubsub";
import { Reporter }       from "/evolux.supervise";

import Facade             from "/thoregon.crystalline/lib/facade.mjs";
import WorkerProvider     from "/thoregon.crystalline/lib/providers/workerprovider.mjs";
import IdentityReflection from "./identityreflection.mjs";


export default class IdentityAccess extends Reporter(EventEmitter) {

    constructor(props) {
        super(props);
    }

    /*
     * API
     */

    /**
     * create a user with an alias and a password
     *
     * @param alias
     * @param password
     * @return {Promise<void>}
     */
    async create(alias, password) {
        await this.connectSE();
        return await this.identity.create(alias, password);
    }

    /**
     * authenticate and signon user with its alias and password
     *
     * @param alias
     * @param password
     * @return {Promise<void>}
     */
    async auth(alias, password) {
        // await IdAdapter.auth(alias, password);
        return await this.signon(alias,password);
    }

    async signon(alias, password) {
        await this.connectSE();
        return await this.identity.signon(alias, password);
    }

    async delete(alias, password) {
        await this.connectSE();
        return await this.identity.delete(alias, password);
    }

    /**
     * find a user by its alias or its public key
     *
     * @param apubkeyoralias
     * @return {Promise<*>}
     */
    async find(apubkeyoralias) {
        // return await IdAdapter.find(apubkeyoralias);
    }

    /**
     * is a user currently signed on
     * @return {Promise<void>}
     */
    get is() {
        return universe.identity?.is;
    }

    async saveIdentity() {
        await this.connectSE();
        return universe.identity;
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
            let SE  = await Facade.use(await WorkerProvider.from('/thoregon.identity/lib/identityservice.mjs'));
            this.identity = SE;
            // universe.identity = identity;

            // listen to all events
            SE.subscribe('signon', () => this.signedon(SE));
            SE.subscribe('signoff', () => this.hasLeft(SE));
            SE.subscribe('created', ({ alias }) => this.identityCreated(alias));
            SE.subscribe('deleted', ({ alias }) => this.identityDeleted(alias));
            // create:
            //  - universe.me
            //  - me
            let identity      = new IdentityReflection({ SE }); // create an identity reflection
            universe.identity = identity;       // todo [DEPRECIATED]: replace in code
            universe.me       = identity;
            universe.global('me');              // caution: can't be changed later. secure all methods by checking if user is signed on
        } catch (e) {
            this.logger.error('No SE interface', e);
        }
    }

    signedon() {
        // connect all identity properties with persistent items
        // connect
        this.emit('auth', universe.me);
    }

    identityCreated(alias) {
        this.emit('identity created', alias);
    }

    identityDeleted(alias) {
        this.emit('identity deleted', alias);
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
