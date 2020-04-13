/**
 * This is a reflection of a distributed identity which
 * resides in universe matter
 *
 * @author: blukassen
 */


export default class IdentityReflection {

    constructor({
                    did,            // distributed identifier
                    anchor,         // this is a refernce to the real identity (e.g. a gun User) wrapped by this reflection
                    pair            // a keypair
                } = {}) {
        Object.assign(this, { handle, anchor , pair });
    }

    /**
     * get a derived DID for a service.
     * Each service gets its own DID to prevent traceability across service
     */
    derivedDID(serviceid) {

    }


}
