/**
 *
 *
 * @author: blukassen
 */



import { EError}    from "/evolux.supervise";

export const ErrNotAuthenticated            = ()            => new EError(`Not authenticated`,                "IDENTITY:00001");
export const ErrCantCreateIdentity          = ()            => new EError(`Can't create identity`,            "IDENTITY:00002");
