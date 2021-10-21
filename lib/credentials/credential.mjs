/**
 * A credential is a set of one or more claims made by the same entity.
 * Credentials might also include an identifier and metadata to describe properties of the credential,
 * such as the issuer, the expiry date and time, a representative image,
 * a public key to use for verification purposes, the revocation mechanism, and so on.
 * The metadata might be signed by the issuer.
 * A verifiable credential is a set of tamper-evident claims and metadata that
 * cryptographically prove who issued it.
 *
 * Typically a credential should provide at least teh following metadata:
 * - type, a reference (name) for which additional information (maybe behavior) can be found in a directory or repository
 * - issuer
 * - issue date
 * - credential subject
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export default class Credential {

    constructor({ metadata, claims, proofs } = {}) {
        this.metadata = metadata ?? {};
        this.claims   = claims ?? [];
        this.proofs   = proofs ?? [];
    }
}
