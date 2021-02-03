Identiy
=======

provides an API layer to enable usage of self sovereign identites
within Thoregon

## Thoregon Identity

A storage in the distributed web 

Other identites can reference to this
-> e.g. thoregon:did:RHg54wKIloQJBJHxwUiKzCB

### Thatsme Identity

Additional behavior and storage 

## gun

Map gun users to Thoregon


## Onlykey (FIDO)

Hardware tokens
 
## Metamask

https://docs.metamask.io/guide/

```js
    // enter with MetaMask
    await ethereum.send('eth_requestAccounts')
```

## Directories

inspired by X.400 (ldap)
query identities

Thoregon provides a central directory

## Key Pairs for Authorities

Problem is the quality of the key pair. Authorities may not trust
a self generated key by the user.

- Authority geenrates key pair
- Pass it to the user 
    - discard the private key
- Create attest
- Identity creates an addition to the attest signed with the keypait
- Authority rechecks with the pub key if the key pair is used

Solutions with zero knowledge proofs
Homomorphic Encryption e.g. user supplies an encrypted seed
