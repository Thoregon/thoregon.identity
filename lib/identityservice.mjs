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

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Keep as private as possible!!!
// Cause the 'credentials' contains also private keys, they should not be accessible anywhere else
//

let _alias;
let _pwd;
let _credentials;
let _idsalt;

///////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////
// private methods
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

async function encrypt(pwd, salt, credentials) {
    const secret    = await SEA.work(pwd, salt);
    const encrypted = await SEA.encrypt(credentials, secret);
    return encrypted;
}

async function decrypt(pwd, salt, credentials) {
    const secret    = await SEA.work(pwd, salt);
    const decrypted = await SEA.decrypt(credentials, secret);
    return decrypted;
}

async function getIdSalt() {
    if (_idsalt) return _idsalt;
    _idsalt = await baseDB.get(TDEVICE);    // todo: take care this exists!
}

///////////////////////////////////////////////////////////////////////////////////////////////////////


export default class IdentityService {

    /**
     * check if there is an identity with the specified alias
     *
     * @param {String} alias
     * @return {Promise<boolean>}
     */
    is(alias) {
        return (alias === alias);
    }

    /**
     *
     * @param alias
     * @param pwd
     * @return {Promise<void>}
     */
    async signon(alias, pwd) {
        if (_alias === alias && _pwd === pwd) return true;           // is already signed on
        if (_alias === alias && _pwd !== pwd) throw "Can't signon";  // nice try!
        if (_alias !== undefined) await this.signoff(alias);

        const entry = await getEntry(alias);
        if (!entry) throw "Can't signon";
        const { salt, credentials } = entry;
        _credentials = await decrypt(pwd, salt, credentials);
        if (!_credentials) throw "Can't signon";
        _alias = alias;
        _pwd   = pwd;
        return true;
    }

    /**
     * just signoff the identity
     *
     * @param alias
     * @return {Promise<void>}
     */
    async signoff(alias) {
        _alias       = undefined;
        _pwd         = undefined;
        _credentials = undefined;
    }

    /**
     * create an identity
     * throws it there is an identity with the alias
     *
     * @param alias
     * @param pwd
     * @param credentials
     * @return {Promise<boolean>}
     */
    async create(alias, pwd) {
        let entry = await getEntry(alias);
        if (entry) throw "Can't create identity";   // exists, don't care if it could be decrypted anyways
        const pairs     = await SEA.pair();
        const salt      = await SEA.rndstr(9);
        _alias          = alias;
        _pwd            = pwd;
        _credentials    = { pairs };
        const encrypted = await encrypt(pwd, salt, _credentials);
        await setEntry(alias, salt, encrypted);
        return true;
    }

    async delete(alias, pwd) {
        if (_alias === alias && _pwd !== pwd) throw "Can't delete";  // nice try!
        if (_alias === alias) await this.signoff(alias);

        let entry = await getEntry(alias);
        if (!entry) return false;
        const { salt, encrypted } = entry;
        const credentials = await decrypt(pwd, salt, encrypted);
        if (!credentials)  throw "Can't delete";
        await dropEntry(alias);
        return true;
    }

    /**
     * link to a hosted identity
     * credentials will be provided by the host service
     *
     * @param credentials
     * @return {Promise<void>}
     */
    async hosted(credentials) {

    }

    /**
     *
     * @param nickname
     * @param messagehandle
     * @return {Promise<void>}
     */
    async guest({ nickname, messagehandle } = {}) {
        await awake(nickname);

    }

}
