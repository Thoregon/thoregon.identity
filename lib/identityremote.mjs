/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import Identity from "./identity.mjs";

const DBGID = '## Identity';

export default class IdentityRemote extends Identity {

    constructor(...args) {
        super(...args);
    }

    async ssi({ guest = false, create = false, hosted = false} = {}) {
        if (!this._ssi) {
            let anchor = await this.anchor();
            const ssi = await this.getRemoteSSI(anchor);
            if (!ssi) {
                console.log(">> SSI could not be established", anchor);
                return;
            }
            this._ssi = ssi;
            // this.attachDevice(ssi);  todo: device as top level object is not used anywhere. check again if we need it
            // ssi.with(this);
            universe.global('me', ssi);
            universe.debuglog(DBGID, "ssi: init DONE");
        }
        return this._ssi;
    }

    getRemoteSSI(anchor) {
        // todo: create remote object to 'anchor'
        return { anchor };
    }

}