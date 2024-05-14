/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { AutomationService, Attach, OnMessage } from "/thoregon.truCloud";
// import fs                from '/fs/promises';

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
    async getBase(anchor, { secret } = {}) {
        if (!universe.neuland.has(anchor)) return { ok: false };
        const ssi = ThoregonDecorator.from(anchor);
        if (!ssi) return { ok: false };
        if (ssi.constructor !== SelfSovereignIdentity) return { ok: false };
        // todo: check secret

        ssi.restore$();

        const base = `*${crystallize(ssi, { filter: (name, obj) => name !== 'extendedroot' && name !== 'checkoutSessions' })}`;
        // await universe.fs.writeFile("data/ssi.txt", base);
        return { ok: true, base }
    }

    getState() {
        const state = universe.inow;
        return { state };
    }
}
