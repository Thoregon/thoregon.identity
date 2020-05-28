/**
 *
 *
 * @author: Bernhard Lukassen
 */

import path             from "/path";
import { doAsync }      from "/evolux.universe";
import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

const host = 'http://localhost:8282';  // localhost:8282
const test = !!universe.idtest;

const endpointhost  = (inst) => test ? host : inst;
const makeapi       = (path) => path.startsWith('/') ? path : `/${path}`;
const apirequest    = 'sidrequest';

export default class RegisterServiceAction  extends Action {

    async exec(command, payload, control, bc, errors) {
        const rnd = universe.Gun.text.random;
        const SEA = universe.Gun.SEA;

        let collection = await bc.getCollection('registrationrequests');
        await doAsync();
        // let content = await collection.list;
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
            apiendpoint: sidrequest.apiendpoint,
            email: sidrequest.email,
            pubkeys: sidrequest.keys,
            processed: universe.now
        }
        let hendpoint = endpointhost(sidrequest.installation);

        // create service
        let servicerequest = await services.add(service);

        // todo [OPEN]: check if confirmed

        let request = universe.www.request;
        // invoke the services endpoint; both cases success/error
        let api = makeapi(path.join(sidrequest.apiendpoint, apirequest));
        request.put(`${hendpoint}${api}?status=success&sid=${sid}`, (error, response, body) => {
            // todo [OPEN]: check answer, if an error, don't register the service!
            universe.logger.debug(`[RegisterServiceAction] result: ${body}`);
        });

        return servicerequest;
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
        let sidrequest = requests[0];
        let hendpoint = endpointhost(sidrequest.installation);
        // invoke the services endpoint; case: error
        let api = makeapi(path.join(sidrequest.apiendpoint, apirequest));
        request.put(`${hendpoint}${api}?status=error&message=CantAddService-${errmsgs}`, (error, response, body) => {
            // todo
            universe.logger.debug(`[RegisterServiceAction] result: ${body}`);
        });
    }
}
