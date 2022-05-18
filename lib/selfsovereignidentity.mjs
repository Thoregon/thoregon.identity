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

        this.object("device", "Device", { persistent: false });
        this.object("app", "ThoregonApplication", { persistent: false });
    }

}

export default class SelfSovereignIdentity extends ThoregonEntity() {

    async init() {
        // create all directories for the SSI
        this.credentials  = await Directory.initiate();
        this.contacts     = await Directory.initiate();
        this.channels     = await Directory.initiate();
        this.agents       = await Directory.initiate();
        this.devices      = await Directory.initiate();
        this.collections  = await Directory.initiate();
        this.repositories = await Directory.initiate();
        this.apps         = await Directory.initiate();
        this.aliases      = await Directory.initiate();
        this.mediathek    = await SSIMediaDirectory.initiate();

        // create the 'current' device

        // create initial apps
    }

    async complete() {
        // todo
        await this.mediathek;
        if (this.mediathek) {
            // todo: init fns when restored
            await this.mediathek.hasCID;
            await this.mediathek.getCID;
            await this.mediathek.addCID;
            const fn = await this.mediathek.allCIDs;
            await this.mediathek.allCIDs();
        }
    }

}

SelfSovereignIdentity.checkIn(import.meta, SelfSovereignIdentityMeta);
