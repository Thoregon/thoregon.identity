/**
 *
 *
 * @author: blukassen
 */



import { EError}    from "/evolux.supervise";

export const ErrNoThatsmePlusResource       = ()            => new EError(`Required 'thatsme.plus' not available, domain ownership unproven`,   "SSI:00001");
export const ErrCommandNotFound             = (msg)         => new EError(`command not found '${msg}'`,                                         "SSI:00002");

