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
// import { ROOT }               from "/thoregon.neuland/src/storage/neulanddb.mjs";

import ThoregonEntity, { ThoregonObject } from "/thoregon.archetim/lib/thoregonentity.mjs";
import ThoregonDecorator      from "/thoregon.archetim/lib/thoregondecorator.mjs";

import { doAsync, timeout }   from "/evolux.universe";

import { ErrIdentityInvalid } from "./errors.mjs";

const SSI_SYNC_WAIT         = 400;
const SSI_SYNC_FOREIGN_WAIT = 2000;
const SYS_ESTABLISH         = 500;

const DBGID = '## Identity';

const ROOT = '00000000000000000000000000000000';

export default class Identity extends SharedCrypto(Reporter()) {

    constructor({
                    did,            // distributed identifier
                    // SE,             // this is a reference to the secure element wrapped by this reflection
                } = {}) {
        super();
        Object.assign(this, { did/*, SE*/ });
    }

    get isIdentity() {
        return true;
    }

    async anchor() {
        debugger;
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
    async ssi({ guest = false, create = false, hosted = false, anchor, apiKey } = {}) {
        if (!this._ssi) {
            anchor = universe.neuland.migrateRoot(anchor);
            // anchor = universe.neuland.has(universe.neuland.ROOT) ? universe.neuland.ROOT : anchor;
            universe.debuglog(DBGID, "ssi: get root entry");
            let ssi  = await this.restoreSSI(anchor);
            if (!this._ssi) this._ssi = ssi;    // todo [REFACTOR]: sometimes this method is called twice. fix it, has to do with the 'auth' event and the signedon handler
            if (!ssi) {
                console.log(">> SSI could not be established", anchor);
                return;
            }
            if (!ssi.apiKey) ssi.apiKey = apiKey;
            universe.global('me', ssi);
            universe.debuglog(DBGID, "ssi: init DONE");
            // this._ssi = ssi;
        }
        return this._ssi;
    }
/*

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
*/

    async restoreSSI(anchor) {
        let ssi = SelfSovereignIdentity.from(anchor);
        ssi._created = false;
        if (!ssi.materialized) {
            console.log("-- SSI: create new, did not exist");
            universe.debuglog(DBGID, "ssi: new, was not materialized");
            ssi.init();
            universe.debuglog(DBGID, "ssi: initialized");
            ssi.materialize();
            universe.debuglog(DBGID, "ssi: materialized");
        } else {
            console.log("-- SSI: started");
        }
        if (ssi.constructor !== SelfSovereignIdentity) {
            universe.debuglog(DBGID, "ssi: instance is not a SelfSovereignIdentity");
            // debugger;
        }
        ssi.complete();
        universe.debuglog(DBGID, "ssi: attach device");
        return ssi;
    }

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
            // ? need to unlink the 'apps' and reload it again because all app specific classes are missing. will be available when the app is restarted
            ssi.forceMaterialize();
            await timeout(200);
            universe.neuland.flush();
            return ssi;
        } catch (e) {
            // console.log(e);
            if (retry-- > 0) return await this.connectDevice(anchor, { service, secret, retry });
            throw Error("Can't connect device for SSI");
        }
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
        return !!this._ssi;
    }

    async establish() {
        if (!this.is) throw ErrIdentityInvalid();
    }


    /**
     * use keypairs from a host service
     * todo [REFACTOR]: create a new SE facade with with the provided key pairs. should also run in its own context, also toe keys from host service should not be leaked to apps
     * @param credentials
     * @return {Promise<*|void>}
     */
    async hosted(settings, opt) {
        this.isHosted = true;

        await this.ssi({ hosted: true, anchor: settings.anchor, apiKey: settings.apiKey });
    }

    async isSignedOn(settings) {
        return !!this._ssi;
    }

    /*
     * protocol to work with identities
     */
    isGhost() {
        return false;
    }



    //
    // lifecycle
    //

    async create(alias, password) {
        debugger;
    }

    async delete(alias, password) {
        debugger;
    }

/*
    //
    // SE functions
    //

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

    //
    // SE properties
    //

    async setSecretProperty(name, value) {
        return this.SE.setProperty(name, value);
    }

    async getSecretProperty(name) {
        return this.SE.getProperty(name);
    }

    /!*
     * public keys
     *!/

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

    /!**
     *
     * @param payload
     * @return {Promise<*>}
     *!/
    async decrypt(payload) {
        return this.SE.decrypt(payload);
    }

    /!**
     *
     * @param payload
     * @return {Promise<*>}
     *!/
    async encrypt(payload) {
        return this.SE.encrypt(payload);
    }

    /!**
     * provide a public key to get a shared secret with this identity
     * @param epub - encryption public key from other
     * @deprecated
     *!/
    async sharedSecret(epub) {
        return this.SE.secret(epub);
    }

    /!**
     * provide a public key to get a shared secret with this identity
     * @param epub - encryption public key from other
     *!/
    async secret(epub) {
        return this.SE.secret(epub);
    }
*/
}
