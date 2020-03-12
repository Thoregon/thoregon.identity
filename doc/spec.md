Identity
========

Implements Distributed Identites (DID's) for Thoregon.

## Procedure

Someone creates an 'Identity Reflection' in Thoregon. This reflection
can then be secured with 2 factor authentication (e.g. FIDO) and
either be connected to a self souvereign identity from another service
or be defined as Thoregon SSI. 

## Verifiable Claims (Attests)

Verifiable claims (aka: credentials, attestations) can be assigned to the reflection.
The attestor can only retrieve those verifiable claims issued by himself. 
A claim is a statement about a subject. A subject is a thing about which claims can be made. 
Claims are expressed using subject-property-value relationships.
 
 ## Credentials
 Credentials are a set of metadata, verifiable claims and their proofs
 
 ## Presentations
 Presentations are used to present only a portion of the identities credentials to 3rd parties to enhance privacy.
 A presentation should only express proofs of a specific question e.g. 
 - a person is able to do the payment, but not how and for sure not the account balance
 - a parcel service can deliver to a person, but don'e express the address directly to the questioner.
 The questioner should learn nothing about the identity but the information he needs to fulfill the task. 

## Proofs
The proofs for a verifiable credential/claim can be a graph of proofs if necessary (if a proof needs a proof).
The graph/chain of proofs goes up to a publicly accepted certificate, or is a (non interactive) zero konwledge 
proof which does not need an further proofs.

## Supports
- WebAuthn
- FIDO2
- Self-Sovereign Identity
