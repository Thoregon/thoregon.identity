/**
 * Identity webservice for
 *  - service registration
 *  - registration update
 *  - delete registration
 *
 * todo:
 *  - introduce superclass for webservices
 *  - add convention/configuration for dependencies/optional features, swagger generator
 *
 * @author: Bernhard Lukassen
 */

import { RestFull}           from "/evolux.web";
import RegisterServiceAction from "./actions/registerserviceaction.mjs";

export default class ServiceProviderWebservice extends RestFull {

    connect(wwwroot, ctxid) {
        const tru4d     = universe.services.tru4d;


        // service actions

        // todo: need an identity to register a service?
        wwwroot.post('sidrequest', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            try {
                let servicedata = data.content;

                let action = new RegisterServiceAction();
                let requestservice = bc.commands.CreateServiceRegistrationRequestCommand(servicedata);
                let sidrequest = await requestservice.commit();

                res.send(`{ "status": "SUCCESS" }`);
                // res.send(`{ "status": "SUCCESS", "request": "${sidrequest.mailcode}" }`);
            } catch (e) {
                universe.logger.error("[ServiceProviderWebservice->SID Request]", e);
                res.status(500).send(`{ "status": "ERROR" "msg": "${e.message}"}`);
            }
        });

        // reverify request
        wwwroot.post('redorequest', async (req, res, data, utils) => {
            const bc = tru4d.context(ctxid);
            try {
                res.send(`{ "status": "SUCCESS" } `);
            } catch (e) {
                universe.logger.error("[ServiceProviderWebservice->SID Request]", e);
                res.status(500).send(`{ "status": "ERROR" "msg": "${e.message}"}`);
            }
        });

        // email confirm link target
        wwwroot.get('confirm', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            try {
                let check = data.query.check;

                let createservice = bc.commands.RegisterServiceCommand({ check });
                await createservice.commit();

                res.send(`{ "status": "SUCCESS" } `);
            } catch (e) {
                res.status(500).send(`{ "status": "ERROR" "msg": "${e.message}"}`);
            }
        });

        // this a a test sink to get the registered SID
        wwwroot.put('testsid/sid', async (req, res, data, utils) => {
            // const bc        = tru4d.context(ctxid);
            let q = req.query;
            let status = q.status;
            let sid = q.sid;
            let msg = q.message;
            let code = q.code;
            universe.logger.info(`[Got SID] ${status} ${sid} ${msg} ${code}`);
            res.send(`{ "status": "SUCCESS" } `);
        });

        /**** TODO: methods below must be correctly implmented ******************************************************/

        // todo: service registration creates an identity. this is then necessary to modify or get the service registration data
        wwwroot.get('authorize', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            let params = data.query;
            let uid = params.uid;
            let pwd = params.pwd;
            // returns a random salt and the public key from this service
            // clients must pass
            res.send('ACK');
        });

        wwwroot.get('service', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            // get the registration data for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send(`{ "status": "SUCCESS" } `);
        });
        wwwroot.put('service', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            // update registration for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send(`{ "status": "SUCCESS" } `);
        });
        wwwroot.delete('service', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            // delete registration for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send(`{ "status": "SUCCESS" } `);
        });

    }
}
