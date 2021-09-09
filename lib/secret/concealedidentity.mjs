import { ErrNoPermission } from "../../evolux.modules/evolux.everblack/lib/errors.mjs";

/**
 * acts like a 2FA device
 * owns the key pairs and encapsulates them. defines the minimum API
 * where the keys are needed.
 *
 * this is to be wrapped within a shared or service worker
 * to avoid expose private information to any code running
 * local
 *
 * start
 * - check if there is an identity signed on (bound to this device)
 *    - keys stored in indexDB
 *       - create a dedicated store
 *       - keys must be
 *       - https://gist.github.com/saulshanabrook/b74984677bccd08b028b30d9968623f5
 *    - todo [OPEN]: indexDB needs to be wrapped for all other modules and disable access to the key entry
 * - if not, use a ghost identity
 *    - create key pairs for signing and encyption
 *    - allow some dumb propoerties like nickname and email
 * - on signon switch to the SSI
 * - on create SSI
 *    - store keys in indexDB
 *    - apply settings from the ghost collected so far to the new SSI
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import baseDB from "/thoregon.universe/lib/reliant/basedb.mjs";

const SSI = 'SSI';

export default class ConcealedIdentity {

    async init() {
    }

    //
    // identity & lifecycle
    //

    async signon(credentials) {
        const id = credentials.id;
        if (!id) return false;
        let keys = await baseDB.get(`${SSI}#${id}`);
        // there are 3 keypairs which encrypted
    }

    async create(credentials) {

    }

    async drop(credentials) {

    }

    //
    // crypto API
    //

    async sharedSecret(epub) {
        if (!this.keypair.epriv) throw ErrNoPermission('no private key available');
        return everblack().secret(epub, this.keypair);
    }

    async sign(payload) {
        let signed = await everblack().sign(payload, this.keypair);
        return signed;
    }

    // todo [OPEN]:
    //  - derivePublicKey()
    //  - ecryptWithPrivKey()
    //  - decryptWithPubKey()
    //  - ecryptWithPubKey()
    //  - decryptWithPrivKey()

}
