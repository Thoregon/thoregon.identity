/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import IdentityProperty from "./identityproperty.mjs";

const _galaxies = {};

export default class Galaxies extends IdentityProperty {

    get name() {
        return 'galaxies';
    }

    get _anchor() {
        return _galaxies;
    }

    async connect(propertyspec) {
        // get handle to persistent data
    }
}
