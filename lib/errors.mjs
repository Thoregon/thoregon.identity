/**
 *
 *
 * @author: blukassen
 */

import { EError}    from "/evolux.supervise";

export const ErrNotImplemented              = (msg)         => new EError(`Not implemented ${msg}`,           "IDENTITY:00000");
export const ErrNotAuthenticated            = ()            => new EError(`Not authenticated`,                "IDENTITY:00001");
export const ErrCantCreateIdentity          = ()            => new EError(`Can't create identity`,            "IDENTITY:00002");

export const ErrNameMissing                 = (msg)         => new EError(`Name missing ${msg}`,              "IDENTITY:00003");
export const ErrIdentityInvalid             = ()            => new EError(`identity invalid, can't complete`, "IDENTITY:00004");

