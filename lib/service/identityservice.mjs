/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { AutomationService, Attach, OnMessage } from "/thoregon.truCloud";

import { crystallize }       from "/evolux.util/lib/serialize.mjs"
import ThoregonDecorator     from "/thoregon.archetim/lib/thoregondecorator.mjs";
import SelfSovereignIdentity from "../selfsovereignidentity.mjs";

"@AutomationService"
export default class IdentityService {

    "@Attach"
    async attach(handle, appinstance, home) {
        this.handle   = handle;
        this.instance = appinstance;
        this.home     = home;

        console.log(">> IdentityService", appinstance.qualifier);
    }

    /**
     *
     * @param anchor
     * @param secret
     * @returns {{ok: false}|{ok: true, base: string}}
     */
    getBase(anchor, { secret } = {}) {
        const ssi = ThoregonDecorator.getKnownEntity(anchor);
        if (!ssi) return { ok: false };
        if (ssi.constructor !== SelfSovereignIdentity) return { ok: false };
        // todo: check secret

        const base = `*${crystallize(ssi, { filter: (name, obj) => name !== 'extendedroot' })}`;
        return { ok: true, base }
    }
}
