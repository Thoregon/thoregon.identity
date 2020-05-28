/**
 *
 *
 * @author: Bernhard Lukassen
 */

import path             from "/path";
import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

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

        // get the request
        let collection = await bc.getCollection('registrationrequests');
        // let sidrequest = await bc.find(item => item.name === name);
        let registrationrequest = { installation, email, code, description, apiendpoint, keys, requested, created: universe.now } ;      // todo: validate
        const mailcode = rnd(64);
        registrationrequest.mailcode = mailcode;
        await collection.add(registrationrequest);

        // now get the solid (persistent) object
        // let req = collection.solid(registrationrequest);

        let request = universe.www.request;
        // invoke the services endpoint; both cases success/error
        request(`${hendpoint}/thatsme.plus`, async (error, response, body) => {
            if (error || response.statusCode !== 200) {
                let api = makeapi(path.join(apiendpoint, apirequest));
                // Provider could not prove control of the domain
                request.put(`${hendpoint}${api}?status=ERROR&message=RegistrationRequestFailed-NoDomainOwnership&code=${code}`, (error, response, body) => {
                    // todo
                    // universe.logger.debug(`[CheckRegistrationEMailAction] result`);
                });
                return;
            }
            // todo [OPEN]: check answer, if an error, don't register the service!
            universe.logger.debug(`[CheckRegistrationEMailAction] result: ${body}`);
            await this.checkEMail(registrationrequest);
        });
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
            from: '"Test" <bl@bernhard-lukassen.com>', // sender address
            to: email, // list of receivers
            subject: "Confirm Email", // Subject line
            text: `Confirm EMail:\n\n${thatsmeconfirm}?check=${mailcode}\n\nthatsme.plus`
            // html: "<b>Hello world?</b>", // html body
        });
    }

    async rollback(command, payload, control, bc, errors) {
        let request = universe.www.request;
        let errmsgs = this.errormessages(errors);
        let hendpoint = endpointhost(payload.installation);
        // invoke the services endpoint; case: error
        // invoke the services endpoint; case: error
        let api = makeapi(path.join(payload.apiendpoint, apirequest));
        request.put(`${hendpoint}${api}?status=ERROR&message=RegistrationRequestFailed-${errmsgs}&code=${payload.code}`, (error, response, body) => {
            // todo
            universe.logger.debug(`[CheckRegistrationEMailAction] result: ${body}`);
        });
    }
}
