/**
 * do the basic setup of channel in thoregon
 *
 * @author: Bernhard Lukassen
 */

import BoundedContextBuilder from '/thoregon.tru4D';
import SchemaBuilder, { ID, CHILD, REL, INT, REAL, BOOL, STRING, DATE, DATETIME, DURATION, IMAGE, LIST, MAP, SET } from '/evolux.schema';

const ns                = ref => `thoregon.heliots.${ref}`;    // shortcut, DRY

const ctx               = 'services.provider';
const entityName        = 'Service';
const entity            = ns(entityName);
const responsibility    = 'services.provider';

(async () => {
    let sbuilder = new SchemaBuilder();
    sbuilder.name('KeyPair')
        .ref(ns('SubscriptionKeys'))
        .addAttribute({ name: 'pub',                type: STRING})
        .addAttribute({ name: 'epub',               type: STRING})
    ;

    const keysentity = await sbuilder.build();

    sbuilder = new SchemaBuilder();
    sbuilder.name(entityName)
        .ref(ns(entityName))
        .addAttribute({ name: 'id',                 type: STRING, index: true })
        .addAttribute({ name: 'description',        type: STRING })
        .addAttribute({ name: 'endpoint',           type: STRING })
        .addAttribute({ name: 'expirationTime ',    type: DATETIME })
        .addAttribute({ name: 'keys',               type: CHILD(ns('KeyPair')) })
        .addAttribute({ name: 'admin',              type: CHILD(ns('KeyPair')) })
        .key('id')
    ;

    const entity = await sbuilder.build();

    const ctxbuilder = new BoundedContextBuilder();

    ctxbuilder.use(ctx)
        .addSchema(entity)
        .addDefaults(responsibility)
        .collection('services', 'shared')
        .release('2020-05-13.1')
    ;

    await ctxbuilder.build();
    universe.logger.info(`Bounded Context: ${ctx} -> 'Identity Service Registration'`);
})();

export default { ctx, entity };
