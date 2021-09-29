/**
 *
 * Identity Entry in baseDB
 *      key (id): @$SEA.hash(alias)                  the alias will not be stored cleartext
 *      data: {
 *         salt       : 'salt',                      salt for pwd (PBKDF2) key generation
 *         credentials: '<encrypted credentials>     the credentials will be encrypted with the generated key,
 *      }
 *
 * credentials: {
 *          pairs: {
 *              spub,
 *              spriv,
 *              epub,
 *              epriv,
 *              apub,
 *              apriv
 *          }
 *      }
 *
 * The properties entry is used to store all anchors (addresses) to
 * find information about the SSI in the universe
 *
 * todo [OPEN]:
 *  - need to connect to different 2FA or SE for different identities
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import SEA    from "/evolux.everblack/lib/crypto/sea.mjs";
import baseDB from "/evolux.universe/lib/reliant/basedb.mjs";

const TDEVICE = 'tdevice';
const WOPROPS = ['anchor']; // write once properties, can not be overwritten or deleted once set

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Keep as private as possible!!!
// Cause the 'credentials' contains also private keys, they should not be accessible anywhere else
//

let _alias;
let _pwd;
let _salt;
let _credentials;
let _properties;
let _idsalt;

///////////////////////////////////////////////////////////////////////////////////////////////////////
WOPROPS.includes('anchor')
///////////////////////////////////////////////////////////////////////////////////////////////////////
// private methods
//


async function encrypt(pwd, salt, payload) {
    const secret    = await SEA.work(pwd, salt);
    const encrypted = await SEA.encrypt(payload, secret);
    return encrypted;
}

async function decrypt(pwd, salt, payload) {
    const secret    = await SEA.work(pwd, salt);
    const decrypted = await SEA.decrypt(payload, secret);
    return decrypted;
}

async function getIdSalt() {
    if (_idsalt) return _idsalt;
    _idsalt = await baseDB.get(TDEVICE);    // todo: take care this exists!
}

//
// identity entry
//

async function entryid(alias) {
    const salt = getIdSalt();
    const id = `@$${await SEA.hash(alias, salt)}`;
    return id;
}

async function setEntry(alias, salt, credentials) {
    await baseDB.set(await entryid(alias), { salt, credentials });
}

async function getEntry(alias) {
    let entry = await baseDB.get(await entryid(alias));
    return entry;
}

async function dropEntry(alias) {
    await baseDB.del(await entryid(alias));
}

//
// properties entry
//

async function propertiesid(alias) {
    const salt = getIdSalt();
    const id = `@#${await SEA.hash(alias, salt)}`;
    return id;
}

async function setProperties(alias, properties) {
    await baseDB.set(await propertiesid(alias), properties);
}

async function getProperties(alias) {
    let entry = await baseDB.get(await propertiesid(alias));
    return entry;
}

async function dropProperties(alias) {
    await baseDB.del(await propertiesid(alias));
}

function propertyExists(name) {
    return _properties && _properties[name] != undefined;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////


export default class IdentityService {

    /**
     * check if there is an identity with the specified alias
     *
     * @return {Promise<boolean>}
     */
    get is() {
        return !!_alias;
    }

    /**
     *
     * @param alias
     * @param pwd
     * @return {Promise<void>}
     */
    async signon(alias, pwd) {
        // sanity checks first
        if (_alias === alias && _pwd === pwd) return true;           // is already signed on
        if (_alias === alias && _pwd !== pwd) throw "Can't signon";  // nice try!
        if (_alias !== undefined) await this.signoff(alias);

        // get and decrypt the identity entry
        const entry = await getEntry(alias);
        if (!entry) throw "Can't signon";
        const { salt, credentials } = entry;
        _credentials = await decrypt(pwd, salt, credentials);
        // if it can't be decryted, the pwd was wrong
        // todo: even though the decryption with the salt does some 'work' and consumes time, think of an artificial slowdown (wait some seconds)
        if (!_credentials) throw "Can't signon";

        // init private variables
        _alias = alias;
        _pwd   = pwd;
        _salt  = salt;

        // get properties
        const props = await getProperties(alias);
        _properties = (await decrypt(pwd, salt, props)) || {};

        this.emit('signon', { alias });
        return true;
    }

    /**
     * just signoff the identity
     *
     * @param alias
     * @return {Promise<void>}
     */
    async signoff() {
        this.emit('signoff', { alias: _alias });
        // discard private vaiables
        _alias       = undefined;
        _pwd         = undefined;
        _salt        = undefined;
        _credentials = undefined;
        _properties  = undefined;
    }

    /**
     * create an identity
     * throws it there is an identity with the alias
     *
     * note:
     * an identity has different key pairs on each device.
     * the SSI itself does not have a 'central' key pair,
     * it is defined by its anchor (address) in the universe.
     * for every credential, a specialized keypair will be created.
     *
     * the exchange of the anchor using the 'backup' method is encrypted.
     * any kind of messaging, also QR and NFC
     *
     * @param alias
     * @param pwd
     * @param credentials
     * @return {Promise<boolean>}
     */
    async create(alias, pwd) {
        // sanity checks first
        let entry = await getEntry(alias);
        if (entry) throw "Can't create identity";   // exists, don't care if it could be decrypted anyways

        // create crypto credentials
        const pairs     = await SEA.pair();
        const salt      = await SEA.rndstr(9);
        const secret    = await SEA.rndstr(384);

        // init private variables
        _alias          = alias;
        _pwd            = pwd;
        _salt           = salt;
        _credentials    = { pairs, secret };
        _properties     = {};

        // encrypt and store identity entry
        const encrypted = await encrypt(pwd, salt, _credentials);
        await setEntry(alias, salt, encrypted);

        // encrypt and store properties entry
        const eproperties = await encrypt(pwd, salt, _properties);
        await setProperties(alias, salt, eproperties);

        // publish 'identity created'
        this.emit('created', { alias: _alias });

        return true;
    }

    async delete(alias, pwd) {
        // sanity checks first
        if (_alias === alias && _pwd !== pwd) throw "Can't delete";  // nice try!
        if (_alias === alias) await this.signoff(alias);

        // check if the entry exists
        let entry = await getEntry(alias);
        if (!entry) return false;
        const { salt, credentials } = entry;
        const decrypted = await decrypt(pwd, salt, credentials);
        // if it can't be decryted, the pwd was wrong
        if (!decrypted)  throw "Can't delete";

        // remove all local stored information about the identity
        await dropEntry(alias);
        await dropProperties(alias);

        this.emit('deleted', { alias: _alias });
        await this.signoff();
        return true;
    }

    /**
     * link to a hosted identity
     * credentials will be provided by the host service
     *
     * @param credentials
     * @return {Promise<void>}
     */
    async hosted(credentials, properties) {
        _alias       = credentials.alias;
        _credentials = { pairs: credentials.pairs };
        _properties  = properties || {};
        this.emit('signon', { alias: _alias });
        return true;
    }

    /**
     * get the public keys for the identity on this device
     *
     * @return {{apub: *, epub: *, spub: *}}
     */
    get pubKeys() {
        if (!_credentials) throw "Not signed on";
        let pubkeys = {
            spub: _credentials.pairs.spub,
            epub: _credentials.pairs.epub,
            apub: _credentials.pairs.apub,
        }
        return pubkeys;
    }

    async backup(pwd, key) {
        if (pwd !== _pwd) throw "Illegal access";
        let allkeys = _credentials.secret;
        allkeys += ':' + JSON.stringify(_properties);
        const salt = await SEA.rndstr(9);
        key = await SEA.work(key || pwd, salt);     // if another key is supplied use it
        // the
        allkeys = salt + ':' + await SEA.encrypt(allkeys, key);
        return allkeys;
    }

    /*  The other pairs are bound to this device
        // check if there is a signing pair
        allkeys += ((allkeys.length > 0) ? ':' : '') + _credentials.secret;
        // check if there is a derivation pair
        if (_credentials.pairs.epub) {
            allkeys += ((allkeys.length > 0) ? '$' : '') + _credentials.pairs.epub + '$' + _credentials.pairs.epriv;
        }
        // check if there is a asymetric pair
        if (_credentials.pairs.apub) {
            allkeys += ((allkeys.length > 0) ? '$' : '') + _credentials.pairs.apub + '$' + _credentials.pairs.apriv;
        }
*/

    /**
     *
     * @param nickname
     * @param messagehandle
     * @return {Promise<void>}
     */
    async guest({ nickname, messagehandle } = {}) {
        // TBD
    }

    //
    // crypto functions
    //

    async sign(payload) {
        if (!_credentials) throw "not singed on";
        const signed = await SEA.sign(payload, _credentials.pairs)
        return signed;
    }

    async verify(payload) {
        if (!_credentials) throw "not singed on";
        const verify = await SEA.verify(payload, _credentials.pairs)
        return verify;
    }

    async decryptPriv(payload) {
        if (!_credentials) throw "not singed on";
        const decrypted = await SEA.decryptPriv(payload, _credentials.pairs);
        return decrypted;
    }

    async encryptPub(payload) {
        if (!_credentials) throw "not singed on";
        const encrypted = await SEA.encryptPub(payload, _credentials.pairs);
        return encrypted;
    }

    async secret(otherPubkey) {
        if (!_credentials) throw "not singed on";
        const secret = await SEA.secret(otherPubkey, _credentials.pairs);
        return secret;
    }

    /**
     * encrypts a payload with the identities symmetric key
     * @param payload
     * @return {Promise<string|*>}
     */
    async encrypt(payload) {
        if (!_credentials) throw "not singed on";
        const encrypted = await SEA.encrypt(payload, _credentials.secret);
        return encrypted;
    }

    /**
     * decrypt a payload with the identities symmetric key
     * @param payload
     * @return {Promise<string|*>}
     */
    async decrypt(payload) {
        if (!_credentials) throw "not singed on";
        const decrypted = await SEA.decrypt(payload, _credentials.secret);
        return decrypted;
    }

    //
    // properties
    //

    /**
     * set a property for the identity in local (encrypted) store
     * @param name
     * @param value     if 'undefined' the property will be deleted
     * @return {Promise<void>}
     */
    async setProperty(name, value) {
        if (!_alias) throw "Not signed on";
        if (WOPROPS.includes(name) && propertyExists(name)) throw `property '${name}' is set and can't be overwritten`
        if (value == undefined) {
            delete _properties[name];
        } else {
            _properties[name] = value;
        }

        // encrypt and store properties entry
        const eproperties = await encrypt(_pwd, _salt, _properties);
        await setProperties(_alias, eproperties);
    }

    getProperty(name) {
        if (!_alias) throw "Not signed on";
        return _properties[name];
    }

}
