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
        this.collection("home",         Directory, { autocomplete: true, description: 'storage for arbitrary data' });

        this.object("device", "Device", { persistent: false });
        this.object("app", "ThoregonApplication", { persistent: false });
    }

}

export default class SelfSovereignIdentity extends ThoregonEntity() {

    with(ssiagent) {
        this.ssiagent = ssiagent;
    }

    async init() {
        // create all directories for the SSI
        this.credentials  = await Directory.create();
        this.contacts     = await Directory.create();
        this.channels     = await Directory.create();
        this.agents       = await Directory.create();
        this.devices      = await Directory.create();
        this.collections  = await Directory.create();
        this.repositories = await Directory.create();
        this.apps         = await Directory.create();
        this.aliases      = await Directory.create();
        this.mediathek    = await SSIMediaDirectory.create();

        // create the 'current' device

        // create initial apps
    }

    async complete() {
        // todo
/* not necessary anymore! -> PromiseChain implemented
        await this.mediathek;
        if (this.mediathek) {
            // todo: init fns when restored
            await this.mediathek.hasCID;
            await this.mediathek.getCID;
            await this.mediathek.addCID;
            const fn = await this.mediathek.allCIDs;
            await this.mediathek.allCIDs();
        }
*/
    }

    //
    // credentials
    //

    async makeCredentialRequest() {
        const keypairs = await SEA.pair({ rsa: false });
        const credential = { pairs: keypairs }
        const spub = keypairs.spub;
        await this.credentials.put(spub, credential);
        return spub;
    }

    async issueCredential(entity, recipientPubkey, { read = true, write = false } = {}) {
        const credential = { entity, spub: recipientPubkey };
        // create shared secret for encryption
        // create keypair for signature
        // if 'write' allowed, add signature pair, otherwise pubkey only
        return credential;
    }

    async acceptCredential(issuedcredential) {
        const spub = issuedcredential.spub;
        if (!spub) return false; // should throw?
        const credential = await this.credentials.get(spub);
        if (!credential) return false; // should throw?
        // apply shared secret, and signing keys also
        credential.entity = issuedcredential.entity;
    }

}

SelfSovereignIdentity.checkIn(import.meta, SelfSovereignIdentityMeta);
