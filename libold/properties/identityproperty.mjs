/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import { ErrNotImplemented } from "../errors.mjs";

export default class IdentityProperty {

    async engage(propertypec) {
        // universe.notSealed;
        const propname = propertypec.name;
        if (!propname) throw ErrNameMissing(`engage ${this.name}:${propname}`);

        Object.defineProperty(this, propname, {
            configurable: false,
            enumerable: true,
            get: () => this.get(propname),
        });
    }

    get name() {
        // implement by subclass
        throw ErrNameMissing('engage galaxy');
    }

    get _anchor() {
        // implement by subclass
        throw ErrNotImplemented('_anchor');
    }

    async connect(propertyspec) {
        // implement by subclass
        throw ErrNotImplemented('connect');
    }

    get(name) {
        const prop = this._anchor[name];
        return prop;
    }
}
