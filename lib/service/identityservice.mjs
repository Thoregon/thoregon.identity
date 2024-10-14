/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { AutomationService, Attach, OnMessage } from "/thoregon.truCloud";
// import fs                from '/fs/promises';

import { crystallize }                          from "/evolux.util/lib/serialize.mjs"
import { encodeObjectToDataView, gzipDataView } from "/evolux.util/lib/transport.mjs";
import ThoregonDecorator                        from "/thoregon.archetim/lib/thoregondecorator.mjs";
import SelfSovereignIdentity                    from "../selfsovereignidentity.mjs";


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

        // ssi.restore$();

        // me.transportPackage({ filter: (name, obj) => !(['extendedroot', 'channels', 'checkoutSessions'].includes(name)) })

        const base = `*${crystallize(ssi, { filter: (name, obj) => !(['extendedroot', 'channels', 'checkoutSessions'].includes(name)) })}`;
        console.log("-- IdentityService getBase", anchor, base?.length ?? 0);
        // await universe.fs.writeFile("data/ssi.txt", base);
        return { ok: true, base }
    }

    async getBaseDB(anchor, { secret } = {}) {
        if (!universe.neuland.has(anchor)) return { ok: false };
        const ssi = ThoregonDecorator.from(anchor);
        if (!ssi) return { ok: false };
        if (ssi.constructor !== SelfSovereignIdentity) return { ok: false };
        // todo: check secret

        // ssi.restore$();

        const db = me.transportPackage({ filter: (name, obj) => !(['extendedroot', 'channels', 'checkoutSessions'].includes(name)) });

        const encoded = encodeObjectToDataView(db);
        const gzipped = gzipDataView(encoded);

        console.log("-- IdentityService getBaseDB", anchor, gzipped?.length ?? 0);
        // await universe.fs.writeFile("data/ssi.txt", base);
        return { ok: true, db: gzipped };
    }

    getState() {
        const state = universe.inow;
        return { state };
    }

/*    async getFullBase(anchor, { secret } = {}) {
        if (!universe.neuland.has(anchor)) return { ok: false };
        const ssi = ThoregonDecorator.from(anchor);
        if (!ssi) return { ok: false };
        if (ssi.constructor !== SelfSovereignIdentity) return { ok: false };
        // todo: check secret

        ssi.restore$();

        // me.transportPackage({ filter: (name, obj) => !(['extendedroot', 'channels', 'checkoutSessions'].includes(name)) })

        const base = `*${crystallize(ssi, { filter: (name, obj) => !(['extendedroot', 'channels', 'checkoutSessions'].includes(name)) })}`;
        console.log("-- IdentityService getFullBase", anchor, base?.length ?? 0);
        // await universe.fs.writeFile("data/ssi.txt", base);
        return { ok: true, base }
    }*/

}
