/**
 * A claim is a statement about a subject.
 * Claims are expressed using subject-property-value relationships.
 *
 * Individual claims can be merged together to express a graph of information about a subject.
 * (Means the value can be a claim again)
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Claim {

    constructor({ subject, property, value } = {}) {
        this.subject  = subject;
        this.property = property;
        this.value    = value;      // can be a claim again
    }

}
