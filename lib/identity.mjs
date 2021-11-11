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
 *
 * @author: blukassen
 */

import { SharedCrypto }      from "/evolux.everblack";
import { Reporter }          from "/evolux.supervise";

import SelfSovereignIdentity  from "./selfsovereignidentity.mjs";
import ThoregonDecorator      from "/thoregon.archetim/lib/thoregondecorator.mjs";
import { ErrIdentityInvalid } from "./errors.mjs";

import GunIdentityResolver    from "./resolvers/gunidentityresolver.mjs";

export default class Identity extends SharedCrypto(Reporter(SelfSovereignIdentity)) {

    constructor({
                    did,            // distributed identifier
                    SE,             // this is a reference to the secure element wrapped by this reflection
                } = {}) {
        super();
        Object.assign(this, { did, SE });
        this._galxies = [];
        this._tempGalaxies = {};
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
        if (this.resolver) this.resolver.release();
        delete this.entity;
        delete this.resolver;
        if (this.SE) {
            await this.SE.signoff();
            // delete this.SE;
            // delete universe.me;
            // delete global 'me'
            // universe.Identity.hasLeft(this);
        }
    }

    get is() {
        return this.SE?.is;
    }

    async establish() {
        if (!this.is) throw ErrIdentityInvalid();
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
        return await this.SE.hosted(settings.pairs, settings.salt, { anchor: settings.anchor });
    }

    /*
     * protocol to work with identities
     */
    isGhost() {
        return !(this.SE?.is);
    }

    /*
     * main properties
     */

    get device() {

    }

    get devices() {

    }

    hasQuery(name) {
        // todo
        // return !!this._[name];
        return false;
    }

    getGalaxy(name) {
        // todo
        return;
    }

    hasGalaxy(name) {
        return !!this._tempGalaxies[name];
    }

    getGalaxy(name) {
        return this._tempGalaxies[name];
    }

    // ! is a query on claims -> galaxymap, starmap
    get galaxies() {

    }

    /**
     * credentials
     *
     * each credential is a set of claims and proofs
     *
     * @see https://www.w3.org/TR/vc-data-model/#credentials
     */
    get credentials() {

    }

/* ! not necessary as own collection, may be a query
    get grants() {

    }
*/

    get contacts() {

    }

    get agents() {

    }

    // ! is a query on claims
    get apps() {

    }

    // ! is a query on claims
    get repositories() {
    // thoregon repository is always added
    }

    set alias(alias) {
        this._currentAlias = alias;
    }

    get alias() {
        return this._currentAlias;
    }

    get aliases() {
        return this._currentAlias ? [ this._currentAlias ] : [];
    }

    /**
     * communication channels
     * ! is a query on claims
     */
    get channels() {

    }

    /**
     * arbitrary properties the user can define
     */
    get properties() {

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

    //
    // persistence
    //

    _$_addQuery(ctxname, name, query) {
        // todo
        // queryname = '/' + ctxname + '/' + name
        // reject duplicate names
    }

    //
    // testing
    //

    /**
     * this overrides persistent galaxies in the universe for testing
     * todo: add repository to origin
     * @param galaxies
     */
    _$_addTempGalaxies(ctxname, galaxies) {
        Object.entries(galaxies).forEach(([name, galaxy]) => {
            this._tempGalaxies['/' + ctxname + '/' + name] = galaxy.map(star => ThoregonDecorator.observe(star, { inmem: true }));
        })
    }

}
