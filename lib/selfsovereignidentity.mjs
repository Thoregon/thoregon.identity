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
