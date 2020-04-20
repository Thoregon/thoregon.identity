/**
 *
 *
 * @author: blukassen
 */



import { EError}    from "/evolux.supervise";

export const ErrNotAuthenticated            = ()            => new EError(`Not authenticated`,                "IDENTITY:00001");
