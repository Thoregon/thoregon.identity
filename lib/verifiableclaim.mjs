/**
 * Represents a claim from a service to an identity which can be verified
 *
 * @author: Bernhard Lukassen
 */

export default class VerifiableClaim {

    constructor({
                    id,

                } = {}) {
        Object.assign(this, {id});
    }

}
