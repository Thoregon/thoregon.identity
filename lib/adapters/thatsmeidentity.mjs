/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { forEach, aretry }  from '/evolux.util';
import { doAsync, timeout } from '/evolux.universe';
import { IdentityShim }     from '/evolux.everblack';

const listeners = [];

const rnd       = universe.random;
const everblack = () => universe.Gun.SEA;

export default class ThatsmeIdentity {

    constructor({
                    id
                } = {}) {
        Object.assign(this, { id });
    }

}
