/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import Facade         from "/thoregon.crystalline/lib/facade.mjs";
import JSConsumer     from "/thoregon.crystalline/lib/consumers/jsconsumer.mjs";
import IdentitySecret from "./lib/identitysecret.mjs";

export default Facade.use(await JSConsumer.with(new IdentitySecret()));
