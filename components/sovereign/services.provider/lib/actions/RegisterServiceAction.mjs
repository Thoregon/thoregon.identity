/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }      from "/evolux.universe";
import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

const host = 'http://192.168.37.53:8282';  // localhost:8282
const test = !!universe.idtest;

const endpointhost = (inst) => test ? host : inst;

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
        let hendpoint = endpointhost(sidrequest.installation);

        // create service
        await services.add(service);

        // mark request as done
        let dbrequest = collection.solid(sidrequest);
        dbrequest.processed = universe.now;
        dbrequest.sid = sid;

        let request = universe.www.request;
        // invoke the services endpoint; both cases success/error
        request.put(`${hendpoint}${sidrequest.endpoint}?status=success&sid=${sid}`, (error, response, body) => {
            // todo [OPEN]: check answer, if an error, don't register the service!
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
        let hendpoint = endpointhost(sidrequest.installation);
        // invoke the services endpoint; case: error
        request.put(`${hendpoint}${sidrequest.endpoint}?status=error&message=CantAddService-${errmsgs}`, (error, response, body) => {
            // todo
            universe.logger.debug(`[RegisterServiceAction] result: ${body}`);
        });
    }
}
