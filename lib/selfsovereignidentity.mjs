/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import ThoregonEntity    from "/thoregon.archetim/lib/thoregonentity.mjs";
import MetaClass         from "/thoregon.archetim/lib/metaclass/metaclass.mjs";
import Collection        from "/thoregon.archetim/lib/collection.mjs";
import Directory         from "/thoregon.archetim/lib/directory.mjs";
import SSIMediaDirectory from "/thoregon.truCloud/lib/unifiedfile/ssimediadirectory.mjs";
import SEA               from "/evolux.everblack/lib/crypto/sea.mjs";

export class SelfSovereignIdentityMeta extends MetaClass {

    initiateInstance() {
        this.name = "SelfSovereignIdentity";

        this.collection("credentials",  Directory, { autocomplete: true });
        this.collection("contacts",     Directory, { autocomplete: true });
        this.collection("channels",     Directory, { autocomplete: true });
        this.collection("agents",       Directory, { autocomplete: true });
        this.collection("devices",      Directory, { autocomplete: true });
        this.collection("collections",  Directory, { autocomplete: true });
        this.collection("repositories", Directory, { autocomplete: true });
        this.collection("apps",         Directory, { autocomplete: true });
        this.collection("aliases",      Directory, { autocomplete: true });
        this.collection("mediathek",    SSIMediaDirectory, { autocomplete: true });
        // this.collection("root",         Directory, { autocomplete: true, description: 'storage for arbitrary data' });

        this.object("device", "Device", { persistent: false });
        this.object("app", "ThoregonApplication", { persistent: false });
    }

}

export default class SelfSovereignIdentity extends ThoregonEntity() {

    with(ssiagent) {
        this._ssiagent = ssiagent;
    }

    init() {
    }

    complete() {
    }

    //
    // credentials
    //

    async makeCredentialRequestPair() {
        const pairs = await SEA.pair({ rsa: false });
        return pairs;
    }

    async issueCredential(entity, recipientPubkey, { read = true, write = false } = {}) {
        const credential = { entity, spub: recipientPubkey };
        // create shared secret for encryption
        // create keypair for signature
        // if 'write' allowed, add signature pair, otherwise pubkey only

        // return credential;
    }

    async acceptCredential(issuedcredential, pairs) {
        const spub = issuedcredential.spub;
        if (!spub) return false; // should throw?
        if (spub !== pairs.spub) return false;
        // create a credential with claims based on the issued credential
        //  --> thoregon.identity/lib/credentials
        //  --> https://www.w3.org/TR/vc-data-mode
        //  --> https://www.w3.org/TR/vc-use-cases/
        // const credential = { pairs, entity: issuedcredential };
        // await this.credentials.put(spub, credential);
    }

}

SelfSovereignIdentity.checkIn(import.meta, SelfSovereignIdentityMeta);
