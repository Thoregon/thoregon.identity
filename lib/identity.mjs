/**
 * This is a reflection of a distributed identity which
 * resides in universe matter
 *
 * Works together with an SE (secure element) which encapsulates private keys
 * an performs basic crypto functions like signing, deriving keys and asymetric encryption
 *
 * todo [OPEN]
 *  - intruduce a state machine for lifecycle --> replace/split establish()
 *  - support DID
 *  - support 2FA
 *  - manage access to personal data (see OpenID Connect, ...)
 *      - verifiyable claims
 *  - add a lifecycle state machine for
 *      - init of SSI
 *      - signon state
 *      - identity type (ghost, guest, hosted, ssi)
 *
 * @author: blukassen
 */

import { Reporter }           from "/evolux.supervise";
import { decrystallize }      from "/evolux.util/lib/serialize.mjs"
import SharedCrypto           from "/evolux.everblack/lib/identity/sharedcrypto.mjs";
import SelfSovereignIdentity  from "./selfsovereignidentity.mjs";
import DeviceAnchor           from "/thoregon.truCloud/lib/device/deviceanchor.mjs";
import Device                 from "/thoregon.truCloud/lib/device/device.mjs";

import ThoregonEntity, { ThoregonObject } from "/thoregon.archetim/lib/thoregonentity.mjs";
import ThoregonDecorator      from "/thoregon.archetim/lib/thoregondecorator.mjs";

import { doAsync, timeout }   from "/evolux.universe";

import { ErrIdentityInvalid } from "./errors.mjs";

const SSI_SYNC_WAIT         = 400;
const SSI_SYNC_FOREIGN_WAIT = 2000;
const SYS_ESTABLISH         = 500;

const DBGID = '## Identity';

export default class Identity extends SharedCrypto(Reporter()) {

    constructor({
                    did,            // distributed identifier
                    SE,             // this is a reference to the secure element wrapped by this reflection
                } = {}) {
        super();
        Object.assign(this, { did, SE });
    }

    get isIdentity() {
        return true;
    }

    async anchor() {
        let anchor = await this.SE.getProperty('anchor');
        if (!anchor) {
            anchor = universe.random();
            await this.SE.setProperty('anchor', anchor);
        }
        return anchor;
    }

    /**
     * get a derived DID for a service.
     * Each service gets its own DID to prevent traceability across service
     * needed whenever a credential is requested
     */
    derivedDID(serviceid) {

    }

    async leave() {
        // if (this.resolver) this.resolver.release();
        delete this._ssi;
        if (this.SE) {
            await this.SE.signoff();
            // delete this.SE;
            // delete universe.me;
            // delete global 'me'
            // universe.Identity.hasLeft(this);
        }
    }

    // todo [OPEN]:
    //  - no automatic create of an SSI on this device
    //  - procedure to couple devices and instantiate the SSI

    // todo [REFACTOR]:
    //  - distingush between
    //    - active create an SSI
    //      - init all directories, use defaults
    //    - SSI should exist
    //       - check if there exists the 'anchor' object in the local DB
    //       - if not create it, don't init directories
    //       - try/ wait to sync with exisiting SSI anchor
    async ssi({ guest = false, create = false} = {}) {
        if (!this._ssi) {
            let anchor      = await this.anchor();
            let existsLocal = universe.neuland.has(anchor);
            universe.debuglog(DBGID, "ssi: get with anchor");
            let ssi;
            if (existsLocal) {
                console.log(">> SSI existslocal", anchor);
                ssi = await this.restoreSSI(anchor, existsLocal);
            } else {
                if (create) {
                    console.log(">> SSI existslocal", anchor);
                    ssi = await this.restoreSSI(anchor, existsLocal);
                } else if (guest || globalThis.guestIdentity) {
                    console.log(">> SSI restoreGuest", anchor);
                    ssi = await this.restoreGuest(anchor);
                } else {
                    console.log(">> SSI connectDevice", anchor);
                    ssi = await this.connectDevice(anchor);
                }
            }
            if (!this._ssi) this._ssi = ssi;    // todo [REFACTOR]: sometimes this method is called twice. fix it, has to do with the 'auth' event and the signedon handler
            if (!ssi) {
                // const guest = await this.SE.getProperty('guest');
                // if (guest) {
                //     ssi = await this.restoreSSI(anchor, existsLocal);
                //     this._ssi = ssi;
                // } else {
                    console.log(">> SSI could not be established", anchor);
                    return;
                //}
            }

            this.attachDevice(ssi);
            ssi.with(this);
            universe.global('me', ssi);
            universe.debuglog(DBGID, "ssi: init DONE");
            // this._ssi = ssi;
        }
        return this._ssi;
    }

    async restoreGuest(anchor) {
        let ssi = SelfSovereignIdentity.from(anchor);
        ssi._created = false;
        // await timeout(SSI_SYNC_WAIT); // this should be enough to let the SSI sync
        if (!ssi.materialized) {
            universe.debuglog(DBGID, "guest: new, was not materialized");
            ssi.init();
            universe.debuglog(DBGID, "guest: initialized");
            ssi.materialize();
            universe.debuglog(DBGID, "guest: materialized");
        }
        ssi.complete();
        universe.debuglog(DBGID, "guest: attach device");
        return ssi;
    }

    async restoreSSI(anchor, born = false) {
        let ssi = SelfSovereignIdentity.from(anchor);
        ssi._created = false;
        ssi.demandSync();
        await timeout(born ? SSI_SYNC_WAIT : SSI_SYNC_FOREIGN_WAIT); // this should be enough to let the SSI sync
        if (!ssi.materialized) {
            universe.debuglog(DBGID, "ssi: new, was not materialized");
            ssi.init();
            universe.debuglog(DBGID, "ssi: initialized");
            ssi.materialize();
            universe.debuglog(DBGID, "ssi: materialized");
        }
        if (ssi.constructor !== SelfSovereignIdentity) {
            universe.debuglog(DBGID, "ssi: instance is not a SelfSovereignIdentity");
            // debugger;
        }
        ssi.complete();
        universe.debuglog(DBGID, "ssi: attach device");
        return ssi;
    }

    /*
        async createSSI() {
            let anchor = await this.anchor();
            let ssi = await SelfSovereignIdentity.create({}, { store: anchor });
            await ssi.init();

            await this.attachDevice(ssi);
            return ssi;
        }
    */
    async connectDevice(anchor, { service, secret, retry = 3 } = {}) {
        try {
            if (!universe.services.identity) return;
            await timeout(SYS_ESTABLISH);
            const idservice    = await universe.mq.consumerFor(service ?? universe.services.identity);
            const { ok, base } = await idservice.getBase(anchor, { secret });
            if (!ok || !base) return;
            const ssi          = decrystallize(base.substring(1), { restore: true });
            ssi._created = true;
            if (!ssi) return;
            // need to unlink the 'apps' and reload it again because all app specific classes are missing. will be available when the app is restarted
            ssi.forceMaterialize();
            await timeout(200);
            universe.neuland.flush();
            // this.detachAppContent(ssi);
            // ThoregonDecorator.detach(ssi, 'apps');
            return ssi;
        } catch (e) {
            // console.log(e);
            if (retry-- > 0) return await this.connectDevice(anchor, { service, secret, retry });
        }
    }

    detachAppContent(ssi) {
        const apps = ssi.apps;
        if (!apps) return;
        apps.forEach((app) => {
            app.forEach((appinstance) => {
                const root = appinstance.root;
                if (!root) return;
                const dirs = Object.keys(root);
                dirs.forEach((dir) => ThoregonDecorator.detach(root, dir));
            })
        });
    }

    attachDevice(ssi) {
        let deviceid = universe.t͛device;
        if (!globalThis.device) {
            let deviceanchor = new DeviceAnchor();
            // make it global available
            universe.global('device', deviceanchor);
        }
        const devices = ssi.devices;
        let currentdevice =  devices[deviceid];
        if (!currentdevice) {
            const deviceprops = { id: deviceid, name: thoregon.deviceInfo?.name, deviceInfo: thoregon.deviceInfo };
            currentdevice = Device.create(deviceprops);

            // add it to the devices
            devices[deviceid] = currentdevice;
            // await doAsync();
        } else if (currentdevice.inconsitent()) {
            Object.assign(currentdevice, { id: deviceid, name: thoregon.deviceInfo?.name, deviceInfo: thoregon.deviceInfo });
        }
        device.current = currentdevice;
        return currentdevice;
    }

    attachApp(app) {

    }

    get is() {
        return this.SE?.is;
    }

    async establish() {
        if (!this.is) throw ErrIdentityInvalid();
        // init SSI?
    }

    async encryptAndSign(payload, salt) {
        const encrypted = await this.SE.encrypt(payload, salt);
        const signed    = await this.SE.sign(encrypted);
        return signed;
    }

    async verifyAndDecrypt(payload, salt) {
        const verified  = await this.SE.verify(payload);
        const decrypted = await this.SE.decrypt(verified, salt);
        return decrypted;
    }


    /**
     * use keypairs from a host service
     * todo [REFACTOR]: create a new SE facade with with the provided key pairs. should also run in its own context, also toe keys from host service should not be leaked to apps
     * @param credentials
     * @return {Promise<*|void>}
     */
    async hosted(settings, opt) {
        this.isHosted = true;
        return await this.SE.hosted( { pairs: settings.pairs }, settings.salt, { id: settings.id, anchor: settings.anchor });
    }

    async hasAutoSignon() {
        return await this.SE.hasAutoSignon();
    }

    async autoSignon({ guest = false} = {}) {
        try {
            if (await this.SE.autoSignon()) {
                await this.ssi({ guest });
                return !!this._ssi;
            }
        } catch (e) {
            console.error("Identity.autoSignon", e);
        }
        return false;
    }

    async activateAutoSignon(settings) {
        return await this.SE.activateAutoSignon(settings);
    }

    async isSignedOn(settings) {
        return await this.SE.isSignedOn(settings);
    }

    async guest() {
        const ok = await this.SE.guest();
        // if (!ok) return;
        const ssi = await this.ssi({ guest: true });
        return !!this._ssi;
    }

    /*
     * protocol to work with identities
     */
    isGhost() {
        return !(this.SE?.is);
    }



    //
    // lifecycle
    //

    async create(alias, password) {
        if (!this.SE.create(alias, password)) return false;
        await this.complete();
        return true;
    }

    async delete(alias, password) {
        return this.SE.delete(alias, password);
    }

    //
    // SE properties
    //

    async setSecretProperty(name, value) {
        return this.SE.setProperty(name, value);
    }

    async getSecretProperty(name) {
        return this.SE.getProperty(name);
    }

    /*
     * public keys
     */

    get pubKeys() {
        return this.SE.pubKeys;
    }

    async sign(payload) {
        return this.SE.sign(payload);
    }

    async verify(payload) {
        return this.SE.verify(payload);
    }

    async decryptPriv(payload) {
        return this.SE.decryptPriv(payload);
    }

    async encryptPub(payload) {
        return this.SE.encryptPub(payload);
    }

    /**
     *
     * @param payload
     * @return {Promise<*>}
     */
    async decrypt(payload) {
        return this.SE.decrypt(payload);
    }

    /**
     *
     * @param payload
     * @return {Promise<*>}
     */
    async encrypt(payload) {
        return this.SE.encrypt(payload);
    }

    /**
     * provide a public key to get a shared secret with this identity
     * @param epub - encryption public key from other
     * @deprecated
     */
    async sharedSecret(epub) {
        return this.SE.secret(epub);
    }

    /**
     * provide a public key to get a shared secret with this identity
     * @param epub - encryption public key from other
     */
    async secret(epub) {
        return this.SE.secret(epub);
    }

    /**
     * signon on local peer
     */
    recall() {

    }

}
