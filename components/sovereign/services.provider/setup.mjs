/**
 * do the basic setup of channel in thoregon
 *
 * @author: Bernhard Lukassen
 */

import BoundedContextBuilder, { CreateCommand } from '/thoregon.tru4D';
import RegisterServiceAction                    from "./lib/actions/RegisterServiceAction.mjs";
import CheckRegistrationEMailAction             from "./lib/actions/CheckRegistrationEMailAction.mjs";
import ServiceProviderWebservice                from "./lib/serviceproviderwebservice.mjs";

import SchemaBuilder, { ID, CHILD, REL, INT, REAL, BOOL, STRING, DATE, DATETIME, DURATION, IMAGE, LIST, MAP, SET } from '/evolux.schema';

const ns                = ref => `thoregon.identity.${ref}`;    // shortcut, DRY

const ctx               = 'identity.services.provider';
const responsibility    = 'identity.services.provider';

(async () => {
    // first add the webservices
    universe.Identity.serviceproviderwebservice = new ServiceProviderWebservice();
    universe.Identity.serviceproviderwebservice.start();

    // build the bounded context
    let sbuilder = new SchemaBuilder();
    sbuilder.name('KeyPair')
        .ref(ns('KeyPair'))
        .addAttribute({ name: 'pub',                type: STRING})
        .addAttribute({ name: 'epub',               type: STRING})
    ;

    const keysentity = await sbuilder.build();

    sbuilder = new SchemaBuilder();
    sbuilder.name('ServiceRegistrationRequest')
        .ref(ns('ServiceRegistrationRequest'))
        .addAttribute({ name: 'name',               type: STRING, index: true })
        .addAttribute({ name: 'installation',       type: STRING, index: true })
        .addAttribute({ name: 'endpoint',           type: STRING })
        .addAttribute({ name: 'when',               type: DATETIME })       // todo: autovalue -> now (now + period)
        .addAttribute({ name: 'keys',               type: CHILD(ns('KeyPair')) })
        // .addAttribute({ name: 'admin',              type: CHILD(ns('KeyPair')) })
        .key('name')
    ;

    const serviceRegistrationRequest = await sbuilder.build();

    let checkemailaction = new CheckRegistrationEMailAction();
    checkemailaction.commandid = 'CreateServiceRegistrationRequestCommand'

    sbuilder = new SchemaBuilder();
    sbuilder.name('Service')
        .ref(ns('Service'))
        .addAttribute({ name: 'name',               type: STRING, index: true })
        .addAttribute({ name: 'sid',                type: STRING, index: true })
        .addAttribute({ name: 'installation',       type: STRING, index: true })
        .addAttribute({ name: 'endpoint',           type: STRING })
        .addAttribute({ name: 'since',              type: DATETIME })
        .addAttribute({ name: 'keys',               type: CHILD(ns('KeyPair')) })
        // .addAttribute({ name: 'admin',              type: CHILD(ns('KeyPair')) })
        .key('sid')
    ;

    const service = await sbuilder.build();

    let registeraction = new RegisterServiceAction();

    const ctxbuilder = new BoundedContextBuilder();

    ctxbuilder.use(ctx)
        .addSchema(serviceRegistrationRequest)
        .validate(true)
        .addCommand('CreateServiceRegistrationRequestCommand', responsibility, CreateCommand)
        .collection('registrationrequests', 'shared')
        .addSchema(service)
        .validate(true)
        .addDefaults(responsibility)
        .addCommand('RegisterServiceCommand', responsibility, CreateCommand)
        .collection('services', 'shared')
        .withAction('CheckRegistrationEMailAction', checkemailaction, 'CreateServiceRegistrationRequestCommand')
        .withAction('RegisterServiceAction', registeraction, 'RegisterServiceCommand')
        .release('2020-05-13.1')
    ;

    await ctxbuilder.build();
    universe.logger.info(`Bounded Context: ${ctx} -> 'Identity Service Registration'`);
})();

export default { ctx };
