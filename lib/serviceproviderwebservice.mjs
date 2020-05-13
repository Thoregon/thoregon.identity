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

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

export default class ServiceProviderWebservice extends Reporter(EventEmitter) {

    constructor() {
        super();
        this.wwwqueue = [];         // enqueue path/boundedconntext requests while the REST service not (yet) available
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'ServiceProviderWebservice ready',
            exit:           'ServiceProviderWebservice exit',
        };
    }

    /*
     * service implementation
     */

    start() {
        const services              = universe.services;
        const components            = services.components;

        if (components) {
            components.observe({
                observes:   'web',
                forget:     true,           // do just once, forget after execution
                started:  () => this.establishwebservice()
            });
        }
    }
    stop() {
        // todo: remove 'www' routes -> connect()
        this.emit('exit', { service: this });
    }

    update() {}

    // service helpers
    establishwebservice() {
        this.www = universe.www;
        this.connectAll();
        this.emit('ready', { service: this });
    }

    addServiceRoot(wwwserviceroot, ctxid) {
        if (this.www) {
            this.connect(wwwserviceroot, ctxid);
        } else {
            this.wwwqueue.push({ wwwserviceroot, ctxid });
        }
    }

    connectAll() {
        this.wwwqueue.forEach(({ wwwserviceroot, ctxid }) => {
            this.connect(wwwserviceroot, ctxid);
        })
    }

    connect(wwwserviceroot, ctxid) {
        if (this.www.has(wwwserviceroot)) {
            this.logger.warn(`serviceroot '${wwwserviceroot}' already occupied.`);
            return;     // todo: let others register under this root? yes but only with permission
        }
        let wwwroot = this.www.root(wwwserviceroot);

        // todo: service registration creates an identity. this is then necessary to modify or get the service registration data
        wwwroot.get('auth', async (req, res, data, utils) => {
            // returns a random salt and the public key from this service
            // clients must pass
            res.send('ACK');
        });

        // service actions

        // todo: need an identity to register a service?
        wwwroot.post('service', async (req, res, data, utils) => {
            universe.logger.info(data.content);

            // required data:
            //  - authorization (from admin)
            //  -

            res.send('ACK');
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
