/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { EError}    from "/evolux.supervise";

export const ErrProviderOccupied            = ()            => new EError(`Persistence provider already occupied`,           "IDENTITYPROVIDER:00001");
export const ErrProviderNotReady            = ()            => new EError(`Persistence provider not ready`,                  "IDENTITYPROVIDER:00001");
