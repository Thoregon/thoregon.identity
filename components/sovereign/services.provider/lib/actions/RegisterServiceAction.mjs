/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

export default class RegisterServiceAction  extends Action {

    async exec(command, payload, control, bc, errors) {
        const rnd = universe.Gun.text.random;
        const SEA = universe.Gun.SEA;

        let collection = await bc.getCollection('registrationrequests');
        let sidrequest = await collection.find(item => item.code === payload.code);     // this a random one time code

        if (sidrequest.length < 1) {
            universe.logger.warn()
            return;
        }

        const sid = rnd(64);
        let services = await bc.getCollection('services');
        let service = {
            sid: sid,
            name: sidrequest.name,
            installation: sidrequest.installation,
            email: sidrequest.email,
            pubkeys: sidrequest.pubkeys
        }

        await services.add(service);

        let request = universe.www.request;
        // invoke the services endpoint; both cases success/error
        request.put(`${sidrequest.endpoint}?status=success&sid=${sid}`, (response) => {
            // todo
        });
    }


    async rollback(command, payload, control, bc, err) {
        let request = universe.www.request;
        // invoke the services endpoint; case: error
        request.put(`${sidrequest.endpoint}?status=error&message=CantAddService-${err.message}`, (response) => {
            // todo
        });
    }
}
