/**
 * do the basic setup of single sign on in thoregon
 *
 * Commands:
 * - IdentitySignOn
 * - IdentitySignOff
 *
 * Events:
 * - IdentitySignOn
 * - IdentitySignOff
 *
 * @author: Bernhard Lukassen
 */

import BoundedContextBuilder, { CreateCommand, CommandBuilder } from '/thoregon.tru4D';
import IdentitySignOnAction             from "./lib/actions/identitysignonaction.mjs";

import SchemaBuilder, { ID, CHILD, REL, INT, REAL, BOOL, STRING, DATE, DATETIME, DURATION, IMAGE, LIST, MAP, SET } from '/evolux.schema';

const ns                = ref => `thoregon.identity.${ref}`;    // shortcut, DRY

const ctx               = 'identity.ssi';
const responsibility    = 'identity.ssi';

(async () => {
    let cmdbuilder;
/*

    cmdbuilder = new CommandBuilder();
    cmdbuilder.name('IdentitySignOn')
        .addParam({ name: 'serviceid', type: STRING })
        .addParam({ name: 'signonid', type: STRING })
        .addAction(new IdentitySignOnAction());
    const identitySignOn = await cmdbuilder.build();

    const ctxbuilder = new BoundedContextBuilder();
    ctxbuilder.use(ctx)
        .withCommand(identitySignOn, responsibility)
        .defineEvent('IdentitySignOn')
        .release('2020-05-13.1')
    ;

    await ctxbuilder.build();
    universe.logger.info(`Bounded Context: ${ctx} -> 'Identity Service Registration'`);
*/
})();

export default { ctx };
