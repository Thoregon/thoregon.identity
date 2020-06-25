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

const endpointhost  = (installation) => test ? host : `https://${installation}`;
const makeapi       = (path) => path.startsWith('/') ? path : `/${path}`;
const apirequest    = 'sid';

export default class RegisterServiceAction  extends Action {

    async exec(command, payload, control, bc, errors) {
        const rnd = universe.Gun.text.random;
        const SEA = universe.Gun.SEA;
        const REF = universe.Matter.REF;
        const now = universe.now;

        let collection = await bc.getCollection('registrationrequests');
        await doAsync();
        // let content = await collection.list;
        let requests = await collection.find(item => item.mailcode === payload.check);     // this a random one time code

        if (requests.length < 1) {
            universe.logger.warn(`[RegisterServiceAction] exec, request not found: ${payload.check}`)
            return;
        }
        let sidrequest = requests[0];

        let services = await bc.getCollection('services');
        let service = await services.find(item => item.installation === sidrequest.installation);

        let sid;
        let hendpoint = endpointhost(sidrequest.installation);

        if (service.length > 0) {
            service = service[0];
            sid = service.sid;
            Object.assign(ref, {
                name:           sidrequest.name,
                apiendpoint:    sidrequest.apiendpoint,
                email:          sidrequest.email,
                pubkeys:        sidrequest.keys,
                inception:      now,
                amended:        now,
                created:        now,
                processed:      now
            } );
        } else {
            sid = rnd(32);
            // todo [REFACTOR]: use CreateCommand
            service = {
                installation:   sidrequest.installation,
                sid:            sid,
                name:           sidrequest.name,
                apiendpoint:    sidrequest.apiendpoint,
                email:          sidrequest.email,
                pubkeys:        sidrequest.keys,
                inception:      now,
                amended:        now,
                created:        now,
                processed:      now
            }

            // create service
            service = await services.add(service);
        }

        // todo [OPEN]: check if confirmed
        // todo [REFACTOR]: use ModifyCommand (better ProcessedCommand)
        // Object.assign(sidrequest[REF], { processed: now });

        let request = universe.www.request;
        // invoke the services endpoint; both cases success/error
        let api = makeapi(path.join(sidrequest.apiendpoint, apirequest));
        let answer = `${hendpoint}${api}?status=SUCCESS&sid=${sid}&code=${sidrequest.code}`;
        universe.logger.info('[RegisterServiceAction] apiendpoint ', answer)
        /*await*/ request.put(answer);      // todo [OPEN]: do we need the response?

        return service;
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
        let hendpoint = endpointhost(payload.installation);
        // invoke the services endpoint; case: error
        let api = makeapi(path.join(sidrequest.apiendpoint, apirequest));
        await request.put(`${hendpoint}${api}?status=ERROR&message=CantAddService-${errmsgs}&code=${sidrequest.code}`);
    }

}
