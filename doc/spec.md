Identity
========

Implements Distributed Identites (DID's) for Thoregon.

## Procedure

Someone creates an Identity in Thoregon. This identity is a reflection
of an underlying identity and can then be secured with 2 factor authentication 
(e.g. FIDO) and either be connected to a self souvereign identity from another service
or be defined as Thoregon SSI. 

- Client    
    - create identity
    - request access to bounded context (handshake)
- Service (Context)
    - either grant basic access automatically
    - or queue request, must be granted manually 

An identity should create a new keypair for each service it connects to.
Services should not be able to track identities outside their domain.

## Verifiable Claims (Attests)

Verifiable claims (aka: credentials, attestations) can be assigned to the reflection.
The attestor can only retrieve those verifiable claims issued by himself. 
A claim is a statement about a subject. A subject is a thing about which claims can be made. 
Claims are expressed using subject-property-value relationships.

Attests will always be encoded when transferred or displayed, e.g. in a QR code
 
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

# Personal Setup & Installation

Base for setup and installed components is always an identity. 
Additionally for every device the user uses, a localized setup for the device is created.
A base setup is delivered by the provider of the component(s).

The setup from identities and devices are stored in matter. Even if the security measures are constantly 
being tightened, this setup is not lost

On public installations without a user, the base setup is delivered by the provider. 
A localized setup for the device is created on usage. This setup is stored in the 'localstore'.
Due to tightening security measures, this setup may be lost during longer periods of inactivity.

## Identity Store

A common memory for all SSI's the user creates. The user can invite a new SSI to 
use the common store.

An SSI consists only of a key pair with a reference to the identity store.
   
# Implementation

Since there will be loaded software from arbitrary vendors and providers, there
must be protection of secret data like key pairs.

To separate memory (where the key pair is stored), all identity processing is done 
in a worker in browser, and worker threads in node.
(check for separate virtual machine contexts in node)

Communication is done via postMessage and addEventListener.
This should reduce security issues for private keys.

On the app side there is an IdentityReflection which acts as an interface and
does the communication work.

A VM separation for apps is done from the component loader -> see evolux.dyncomponents
