/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import ThoregonEntity from "/thoregon.archetim/lib/thoregonentity.mjs";
import MetaClass      from "/thoregon.archetim/lib/metaclass/metaclass.mjs";
import Collection     from "/thoregon.archetim/lib/collection.mjs";
import Directory      from "/thoregon.archetim/lib/directory.mjs";

export class SelfSovereignIdentityMeta extends MetaClass {

    initiateInstance() {
        this.name = "SelfSovereignIdentity";

        this.collection("credentials");
        this.collection("contacts");
        this.collection("channels");
        this.collection("agents");
        this.collection("devices");
        this.collection("collections");
        this.collection("repositories");
        this.collection("apps");
        this.collection("aliases");

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

        // create the 'current' device

        // create initial apps
    }

}

SelfSovereignIdentity.checkIn(import.meta, SelfSovereignIdentityMeta);
