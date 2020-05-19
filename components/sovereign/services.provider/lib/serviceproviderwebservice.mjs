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

import { RestFull}                  from "/evolux.web";

export default class ServiceProviderWebservice extends RestFull {

    connect(wwwroot, ctxid) {
        const tru4d     = universe.services.tru4d;

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

        // service actions

        // todo: need an identity to register a service?
        wwwroot.post('sidrequest', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            try {
                let servicedata = data.content;
                //  - authorization (from admin) -> later
                let {
                    name,
                    installation,
                    email,
                    endpoint,
                } = servicedata;
                let pubkeys = servicedata.pubkeys;

                let requestservice = bc.commands.CreateServiceRegistrationRequestCommand(servicedata);
                await requestservice.commit();

                res.send('ACK');
            } catch (e) {
                universe.logger.error("[ServiceProviderWebservice->SID Request]", e);
                res.status(500).send('NACK');
            }
        });

        // email confirm link
        wwwroot.get('confirm', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            try {
                let servicedata = data.content;
                let code = data.code;

                let createservice = bc.commands.RegisterServiceCommand({ code });
                await createservice.commit();

                res.send('ACK');
            } catch (e) {
                res.status(500).send('NACK');
            }
        });

        // this a a test sink to get the registered SID
        wwwroot.put('testsid', async (req, res, data, utils) => {
            // const bc        = tru4d.context(ctxid);
            let q = req.query;
            let status = q.status;
            let sid = q.sid;
            let msg = q.message;
            universe.logger.info(`[Got SID] ${status} ${sid} ${msg}`);
        });

        wwwroot.get('service', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            // get the registration data for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send('ACK');
        });
        wwwroot.put('service', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            // update registration for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send('ACK');
        });
        wwwroot.delete('service', async (req, res, data, utils) => {
            const bc        = tru4d.context(ctxid);
            // delete registration for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send('ACK');
        });

    }
}
