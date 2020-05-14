/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

export default class RegisterServiceAction  extends Action {

    async exec(command, payload, control, bc, errors) {
/*
        let {
            channel,
            subject,
            content
        } = payload;
*/

        // get subscriptions for 'channel'
        let collection      = await bc.getCollection('services');

        // get registered service
        // create a cert and invoke the services endpoint; both cases success/error

    }
}
