/**
 * The Identity Controller provides an API to create and authenticate identities,
 * and it also provides a reflection if there is an identity authenticated
 *
 * This class is named controller, not repository, Because it does not provide its own collection
 * It uses the underlying distributed identities and provides an API
 *
 * start
 *  - check if there is a 2FA device available
 *    - todo [REFACTOR]: signon with 2FA
 *      - may also be an app e.g. Google authenticator
 *    -
 *    - SSI settings are encrypted in matter
 *
 *   universe.Identity      ... controller
 *   mey      ... identity reflection if authenticated
 *
 * todo [OPEN]: plugins for other self souvereign identity systems
 *
 * todo [OPEN]:
 *  - introduce state machine to handle the lifecycle
 *
 * @author: Bernhard Lukassen
 */

import { doAsync, timeout }           from '/evolux.universe';
import { EventEmitter }      from "/evolux.pubsub";
import { Reporter }          from "/evolux.supervise";
import Facade                from "/thoregon.crystalline/lib/facade.mjs";
// import WorkerConsumer   from "/thoregon.crystalline/lib/consumers/workerconsumer.mjs";
import SelfSovereignIdentity from "./selfsovereignidentity.mjs";
import Identity                       from "./identity.mjs";

let _settings;

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
        return await this.identity.signon(password);
    }

    async delete(password) {
        await this.connectSE();
        return await this.identity.delete(password);
    }

    static async getIdentiyClass() {
        const CLASS_REF = universe.IDENTITY_CLASS ?? '/thoregon.identity/lib/identity.mjs';
        const Module = await import(CLASS_REF);
        const Identity = Module.default;
        return Identity;
    }

    async getIdentiyClass() {
        return this.constructor.getIdentiyClass();
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
     * don't forget to 'await' result
     * @return {Promise<void>}
     */
    get is() {
        return globalThis.SSI.is;
    }

    async saveIdentity() {
        await this.connectSE();
        return me;
    }

    async isSignedOn() {
        await this.connectSE();
        const is = await SSI.isSignedOn();
        if (is && !globalThis.me) await SSI.ssi();
        return is;
    }

    async useIdentity(settings, { create } = {}) {
        if (_settings?.anchor === settings.anchor) return true;
        thoregon.checkpoint("identity reflection: use identity");
        _settings = settings;
        await SSI.hosted(settings, { create });
        await this.signedon();
    }

    async agentIdentity(settings) {
        await this.useIdentity(settings, { create: true });
        // await SSI.ssi();
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

    // todo [OPEN]: another secret worker for foreign devices
    async getSecretWorker() {
        if (universe.GET_SECRET_WORKER) {
            const workerfn = await universe.GET_SECRET_WORKER();
            return await workerfn();
        }

        if (!universe.supportsWorkerTypeModule() || !universe.supportsSharedWorker()) {
            const workerfn = (await import('/thoregon.identity/sasecretworker.mjs')).default;
            return workerfn();
        }

        const WorkerConsumer = (await import("/thoregon.crystalline/lib/consumers/workerconsumer.mjs")).default;
        return await Facade.use(await WorkerConsumer.from('/thoregon.identity/lib/identitysecret.mjs'));
    }

    async connectSE() {
        if (globalThis.me || this.identity) return;
        //  - me
        const Identity = await this.getIdentiyClass();
        let identity   = new Identity({ }); // create an identity
        // universe.me       = identity;
        if (!globalThis.SSI) universe.global('SSI', identity);              // caution: can't be changed later. secure all methods by checking if user is signed on
    }

    async signedon() {
        thoregon.checkpoint("identity reflection: signedon");
        // connect all identity properties with persistent items
        // connect
        // me.establish(); // already done
        const ssi = await SSI.ssi({ create: universe.DEV?.ssi ?? universe.ssi });
        if (!ssi) {
            thoregon.checkpoint("identity reflection: SSI not established!");
        } else {
            thoregon.checkpoint("identity reflection: established SSI (me)");
            await timeout(400);
            this.emit('auth', me);
        }
    }

    identityCreated() {
        this.emit('identity created');
    }

    identityDeleted() {
        this.emit('identity deleted');
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
    async start() {
        await this.init();
        universe.$Identity = this;   // publish identity controller
        this.emit('ready', { identitycontroller: this });
    }
    stop() {
        if (this.serviceproviderwebservice) this.serviceproviderwebservice.stop();

        delete universe.Identity;
        this.emit('exit', { identitycontroller: this });
    }

    update() {}

}
