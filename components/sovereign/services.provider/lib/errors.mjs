/**
 *
 *
 * @author: blukassen
 */



import { EError}    from "/evolux.supervise";

export const ErrNoThatsmePulsResource       = ()            => new EError(`Required 'thatsme.plus' not available, domain ownership unproven`, "CLI:00001");
export const ErrCommandNotFound             = (msg)         => new EError(`command not found '${msg}'`,                     "CLI:00002");

