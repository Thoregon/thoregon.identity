/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

export default class IdentitySignOnAction extends Action {

    async exec(command, payload, control, bc, errors) {
        const rnd = universe.Gun.text.random;
        const SEA = universe.Gun.SEA;
    }
}
