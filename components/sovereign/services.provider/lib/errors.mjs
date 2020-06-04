/**
 *
 *
 * @author: blukassen
 */



import { EError}    from "/evolux.supervise";

export const ErrNoThatsmePlusResource       = ()            => new EError(`Required 'thatsme.plus' not available, domain ownership unproven`,   "CLI:00001");
export const ErrCommandNotFound             = (msg)         => new EError(`command not found '${msg}'`,                                         "CLI:00002");
export const ErrSIDRequestExists            = (msg)         => new EError(`SID request already exists '${msg}'`,                                "CLI:00003");

