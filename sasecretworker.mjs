/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import Facade         from "/thoregon.crystalline/lib/facade.mjs";
import JSProvider     from "/thoregon.crystalline/lib/providers/jsprovider.mjs";
import IdentitySecret from "./lib/identitysecret.mjs";

export default Facade.use(await JSProvider.with(new IdentitySecret()));
