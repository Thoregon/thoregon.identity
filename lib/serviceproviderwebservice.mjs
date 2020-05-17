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
        const bc        = tru4d.context(ctxid);

        // todo: service registration creates an identity. this is then necessary to modify or get the service registration data
        wwwroot.get('authorize', async (req, res, data, utils) => {
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
            universe.logger.info(data.content);

            try {
                let servicedata = data.content;
                let {
                    name,
                    installation,
                    email,
                    endpoint,
                } = servicedata;
                let createservice = bc.commands.CreateServiceCommand(servicedata);
                // required data:
                //  - authorization (from admin) -> later
                //  - id (from provider)
                //  - description - optional
                //  - endpoint  ... where to send the registration data in case of success
                //  -

                //
                // await createservice.commit();
                res.send('ACK');
            } catch (e) {
                res.status(500).send('NACK');
            }
        });
        wwwroot.get('service', async (req, res, data, utils) => {
            // get the registration data for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send('ACK');
        });
        wwwroot.put('service', async (req, res, data, utils) => {
            // update registration for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send('ACK');
        });
        wwwroot.delete('service', async (req, res, data, utils) => {
            // delete registration for service
            // check permission with the shared secret handshake

            // required data:
            //  - authorization
            //  -
            res.send('ACK');
        });

    }
}
