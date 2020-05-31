/**
 *
 *
 * @author: Bernhard Lukassen
 */

import path             from "/path";
import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";
import {ErrNoThatsmePulsResource} from "../errors.mjs";
import {ErrSIDRequestExists} from "../../../../../../../thoregon-cli/lib/errors.mjs";

const host = 'http://localhost:8282';  // localhost:8282
const test = !!universe.idtest;

const endpointhost  = (installation) => test ? host : `https://${installation}`;
const apirequest    = 'sid';

const thatsmeconfirm    = test ? 'http://localhost:8282/serviceproviders/confirm' : 'https://api.thatsme.plus/serviceproviders/confirm';
const makeapi       = (path) => path.startsWith('/') ? path : `/${path}`;

export default class CheckRegistrationEMailAction extends Action {

    async exec(command, payload, control, bc, errors) {
        const rnd = universe.Gun.text.random;
        const SEA = universe.Gun.SEA;

        let {
            description,
            installation,
            email,
            code,
            requested,
            apiendpoint,
        } = payload;
        let keys = payload.keys;
        if (installation.endsWith('/')) installation = installation.slice(0, -1);
        let hendpoint = endpointhost(installation);

        let requests = await bc.getCollection('registrationrequests');
        let registrationrequest = await requests.find(item => item.installation === installation);

        // check if a request for the installation exists
        if (!registrationrequest) {
            throw ErrSIDRequestExists(installation);
        } else {
            // let sidrequest = await bc.find(item => item.name === name);
            registrationrequest = { installation, email, code, description, apiendpoint, keys, requested, created: universe.now } ;      // todo: validate
            const mailcode = rnd(64);
            registrationrequest.mailcode = mailcode;
            await requests.add(registrationrequest);
        }

        // now get the solid (persistent) object
        // let req = collection.solid(registrationrequest);

        try {
            let request = universe.www.request;
            // invoke the services endpoint; both cases success/error
            await body = await request(`${hendpoint}/thatsme.plus`);

            // todo [OPEN]: check answer, if an error, don't register the service!
            universe.logger.debug(`[CheckRegistrationEMailAction] result: ${body}`);
        } catch (e) {
            throw new ErrNoThatsmePulsResource();
            // let api = makeapi(path.join(apiendpoint, apirequest));
            // Provider could not prove control of the domain
            // let bodysid = await request.put(`${hendpoint}${api}?status=ERROR&message=RegistrationRequestFailed-NoDomainOwnership&code=${code}`);
        }

        await this.checkEMail(registrationrequest);

        return registrationrequest;
    }

    async checkEMail(registrationrequest) {
        let mailcode = registrationrequest.mailcode;
        let email = registrationrequest.email;
        // get SMTP transport
        let transport = universe.www.getSMTPtransport("testsmtp");      // todo: make configurable
        let hendpoint = endpointhost(registrationrequest.installation);

        // get registered service
        // create a cert and invoke the services endpoint; both cases success/error
        let result = await transport.sendMail({
            from: '"Bernhard Lukassen" <bl@bernhard-lukassen.com>', // sender address
            to: email, // list of receivers
            subject: "Please Confirm Email", // Subject line
            text: `Confirm EMail:\n\n${thatsmeconfirm}?check=${mailcode}\n\nthatsme.plus`
        });
    }

/*
    async rollback(command, payload, control, bc, errors) {
        let request = universe.www.request;
        let errmsgs = this.errormessages(errors);
        let hendpoint = endpointhost(payload.installation);
        // invoke the services endpoint; case: error
        // invoke the services endpoint; case: error
        let api = makeapi(path.join(payload.apiendpoint, apirequest));

        await request.put(`${hendpoint}${api}?status=ERROR&message=RegistrationRequestFailed-${errmsgs}&code=${payload.code}`, (error, response, body) => {
            // todo
            universe.logger.debug(`[CheckRegistrationEMailAction] result: ${body}`);
        });
    }
*/
}
