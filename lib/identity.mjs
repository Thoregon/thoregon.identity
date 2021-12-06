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
 *  - manage access to personal data (see OpenID Connect, ...)
 *      - verifiyable claims
 *  - add a lifecycle state machine for
 *      - init of SSI
 *      - signon state
 *      - identity type (ghost, guest, hosted, ssi)
 *
 * @author: blukassen
 */

import { SharedCrypto }       from "/evolux.everblack";
import { Reporter }           from "/evolux.supervise";
import SelfSovereignIdentity  from "./selfsovereignidentity.mjs";
import DeviceAnchor           from "/thoregon.truCloud/lib/device/deviceanchor.mjs";
import Device                 from "/thoregon.truCloud/lib/device/device.mjs";

import ThoregonEntity, { ThoregonObject } from "/thoregon.archetim/lib/thoregonentity.mjs";

import { doAsync }            from "/evolux.universe";

import { ErrIdentityInvalid } from "./errors.mjs";

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

    async ssi() {
        if (!this._ssi) {
            let anchor = await this.anchor();
            let ssi;
            if (await ThoregonObject.materialized(anchor)) {
                ssi = await SelfSovereignIdentity.from(anchor);
                await this.attachDevice(ssi);
            } else {
                ssi = await this.createSSI();
            }
            this._ssi = ssi;
        }
        return this._ssi;
    }

    async createSSI() {
        let anchor = await this.anchor();
        let ssi = await SelfSovereignIdentity.create({}, { store: anchor });
        await ssi.init();

        await this.attachDevice(ssi);
        return ssi;
    }

    async attachDevice(ssi) {
        let deviceid = universe.t͛device;
        if (!globalThis.device) {
            let deviceanchor = new DeviceAnchor();
            // make it global available
            universe.global('device', deviceanchor);
        }
        let currentdevice =  await ssi.devices[deviceid];
        if (!currentdevice) {
            let currentdevice = await Device.create({ id: deviceid });
            device.current = currentdevice;

            // add it to the devices
            ssi.devices.put(deviceid, currentdevice);
        }
        return currentdevice;
    }

    async attachApp(app) {

    }

    get is() {
        return this.SE?.is;
    }

    async establish() {
        if (!this.is) throw ErrIdentityInvalid();

        if (this._ssi) return;


/*
        if (this.entity) return;
        const SSIResolver = universe.Identity.SSIResolver;
        // get the 'root' fro the identity if it has one
        let ssiroot    = await this.SE.getProperty('ssiroot');
        // when no root, generate one
        if (!ssiroot) {
            do { // get a non existing root for the identity
                ssiroot = universe.random();
            } while (await SSIResolver.occupied(ssiroot));
            await this.SE.setProperty('ssiroot', ssiroot);
        }
        // initialize the persitency resolver for SSI's
        const resolver = this.resolver = SSIResolver.for( {
                                  ssiroot,
                                  spub   : (await this.SE.pubKeys).spub,
                                  encrypt: async (payload) => await this.encryptAndSign(payload),
                                  decrypt: async (payload) => await this.verifyAndDecrypt(payload)
                        });
        resolver.subscribe((evt) => this.identityModified(evt));

        // get the sored entity for the SSI
        let entity = await resolver.getEntity(ssiroot);
        // if there is non, create it initially
        if (!entity) {
            // create the entry
            entity = await this.buildEntity();
            await resolver.createEntity(entity);
        }
        this.entity = entity;
*/
    }

    async buildEntity() {
        let entity = {
            properties: this.entityProperties()
        };

        return entity;
    }

    entityProperties() {
        //
        return {};
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
    async hosted(settings) {
        this.isHosted = true;
        return await this.SE.hosted( { pairs: settings.pairs }, settings.salt, { anchor: settings.anchor });
    }

    async guest(settings) {

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
