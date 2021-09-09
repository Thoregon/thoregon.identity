/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class TwoFactorIdentity {

    async init() {
        // check if there is a 2FA device avialable (connected to the browser)
    }

    //
    // identity & lifecycle
    //

    async signon(credentials) {

    }

    //
    // 2FA
    //

    connect2FA(settings) {

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
