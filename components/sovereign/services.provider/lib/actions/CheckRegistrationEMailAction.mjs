/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { forEach }      from "/evolux.util";

import Action           from "/thoregon.tru4D/lib/action/action.mjs";

export default class CheckRegistrationEMailAction extends Action {

    async exec(command, payload, control, bc, errors) {
        const rnd = universe.Gun.text.random;
        const SEA = universe.Gun.SEA;

        let {
            name,
            description,
            installation,
            email,
            endpoint,
        } = payload;
        let keys = payload.keys;

        // get the request
        let collection = await bc.getCollection('registrationrequests');
        // let sidrequest = await bc.find(item => item.name === name);
        let registrationrequest = { name, installation, email, description, endpoint, keys } ;      // todo: validate
        const code = rnd(64);
        registrationrequest.code = code;
        await collection.add(registrationrequest);

        // get SMTP transport
        let transport = universe.www.getSMTPtransport("testsmtp");      // todo: make configurable

        // get registered service
        // create a cert and invoke the services endpoint; both cases success/error
        transport.sendMail({
            from: '"Test" <test@bernhard-lukassen.com>', // sender address
            to: email, // list of receivers
            subject: "Confirm Email", // Subject line
            text: `Confirm EMail:\n\nhttp://localhost:8282/ssiproviders/confirm?code=${code}`
            // html: "<b>Hello world?</b>", // html body
        });
    }

    async rollback(command, payload, control, bc, errors) {
        let request = universe.www.request;
        let errmsgs = this.errormessages(errors);
        // invoke the services endpoint; case: error
        // invoke the services endpoint; case: error
        request.put(`${payload.endpoint}?status=error&message=RegistrationRequestFailed-${errmsgs}`, (error, response, body) => {
            // todo
            universe.logger.debug(`[CheckRegistrationEMailAction] result: ${body}`);
        });
    }
}
