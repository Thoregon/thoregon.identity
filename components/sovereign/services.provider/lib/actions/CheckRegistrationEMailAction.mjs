/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

const host = 'http://192.168.37.53:8282';  // localhost:8282
const test = !!universe.idtest;

const endpointhost = (installation) => test ? host : `https://${installation}`;

export default class CheckRegistrationEMailAction extends Action {

    async exec(command, payload, control, bc, errors) {
        const rnd = universe.Gun.text.random;
        const SEA = universe.Gun.SEA;

        let {
            description,
            installation,
            email,
            requested,
            endpoint,
        } = payload;
        let keys = payload.keys;
        let hendpoint = endpointhost(installation);

        // get the request
        let collection = await bc.getCollection('registrationrequests');
        // let sidrequest = await bc.find(item => item.name === name);
        let registrationrequest = { installation, email, description, endpoint, keys, requested, created: universe.now } ;      // todo: validate
        const code = rnd(64);
        registrationrequest.code = code;
        await collection.add(registrationrequest);

        // now get the solid (persistent) object
        // let req = collection.solid(registrationrequest);

        let request = universe.www.request;
        // invoke the services endpoint; both cases success/error
        request(`${hendpoint}/thatsme.plus`, async (error, response, body) => {
            if (error || response.statusCode !== 200) {
                // Provider could not prove control of the domain
                request.put(`${hendpoint}${endpoint}?status=error&message=RegistrationRequestFailed-NoDomainOwnership`, (error, response, body) => {
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
        let code = registrationrequest.code;
        let email = registrationrequest.email;
        // get SMTP transport
        let transport = universe.www.getSMTPtransport("testsmtp");      // todo: make configurable
        let hendpoint = endpointhost(registrationrequest.installation);

        // get registered service
        // create a cert and invoke the services endpoint; both cases success/error
        let result = await transport.sendMail({
            from: '"Test" <test@bernhard-lukassen.com>', // sender address
            to: email, // list of receivers
            subject: "Confirm Email", // Subject line
            text: `Confirm EMail:\n\nhttp://${hendpoint}/serviceproviders/confirm?code=${code}\n\nthatsme.plus`
            // html: "<b>Hello world?</b>", // html body
        });
    }

    async rollback(command, payload, control, bc, errors) {
        let request = universe.www.request;
        let errmsgs = this.errormessages(errors);
        let hendpoint = endpointhost(payload.installation);
        // invoke the services endpoint; case: error
        // invoke the services endpoint; case: error
        request.put(`${hendpoint}${payload.endpoint}?status=error&message=RegistrationRequestFailed-${errmsgs}`, (error, response, body) => {
            // todo
            universe.logger.debug(`[CheckRegistrationEMailAction] result: ${body}`);
        });
    }
}
