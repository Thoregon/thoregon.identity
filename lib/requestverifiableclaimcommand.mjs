/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { Command }      from '/thoregon.tru4D';

export default class RequestVerifiableClaimCommand extends Command {

    constructor({
                    id,
                    permisisons
                }) {
        super();
        Object.assign(this, { id, permisisons });
    }


}
