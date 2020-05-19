/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }      from "/evolux.universe";
import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

export default class RegisterServiceAction  extends Action {

    async exec(command, payload, control, bc, errors) {
        const rnd = universe.Gun.text.random;
        const SEA = universe.Gun.SEA;

        let collection = await bc.getCollection('registrationrequests');
        await doAsync();
        let content = await collection.list;
        let requests = await collection.find(item => item.code === payload.code);     // this a random one time code

        if (requests.length < 1) {
            universe.logger.warn(`[RegisterServiceAction] exec, request not found: ${payload.code}`)
            return;
        }
        let sidrequest = requests[0];

        const sid = rnd(128);
        let services = await bc.getCollection('services');
        let service = {
            sid: sid,
            name: sidrequest.name,
            installation: sidrequest.installation,
            endpoint: sidrequest.endpoint,
            email: sidrequest.email,
            pubkeys: sidrequest.keys
        }

        // create service
        await services.add(service);

        // mark request as done
        let dbrequest = collection.solid(sidrequest);
        dbrequest.processed = new Date();
        dbrequest.sid = sid;

        let request = universe.www.request;
        // invoke the services endpoint; both cases success/error
        request.put(`${sidrequest.endpoint}?status=success&sid=${sid}`, (response) => {
            // todo
            universe.logger.debug(`[RegisterServiceAction] result: ${body}`);
        });
    }


    async rollback(command, payload, control, bc, errors) {
        let request = universe.www.request;
        let errmsgs = this.errormessages(errors);
        let collection = await bc.getCollection('registrationrequests');
        await doAsync();
        let content = await collection.list;
        let requests = await collection.find(item => item.code === payload.code);     // this a random one time code
        if (request.length < 1) {
            universe.logger.warn(`[RegisterServiceAction] rollback, request not found: ${payload.code}`)
            return;
        }
        let sidrequest = request[0];
        // invoke the services endpoint; case: error
        request.put(`${sidrequest.endpoint}?status=error&message=CantAddService-${errmsgs}`, (response) => {
            // todo
            universe.logger.debug(`[RegisterServiceAction] result: ${body}`);
        });
    }
}
