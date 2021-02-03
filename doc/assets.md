Assets
======

Assets are collected in collections, which are assigned to the identity. Therefore, no general ledger of assets is necessary.
Assets can be deposited and withdrawn from an asset collection.

## Resources

- media
- credit

## Claims

- assurances
- prepayments

## Attests

- membership
- licence
- ownership
- permissions
    - keypairs of services

## Predefined Collections

- 

Example

```js
    identity.assets.music.deposit(song);
```

## Procedure

- service provides object
    - signature
    - data about attest/asset
    - address of public access Q
- identity 
    - check sig and attest
    - create keypair for service
    - create twin identity store, invites service pub key
    - write address to service Q
- service
    - issue attest
    - write to twin identity store, double signature, only service can modify
- identity 
    - recheck attest
    - if not OK may be removed
