Identiy
=======

Your own digital self

provides an API layer to enable usage of self sovereign identites
within Thoregon

## Create SSI

Multiple Identities for different usage. Collected together in Thatsme
e.g.
- private
- job
- official
- club
- for each membership a separate identity (keypair) will be used

Collect Entropy
- Thatsme
    - three words + one emoji
    - entropy via video/audio?
- Threema   https://www.youtube.com/watch?v=iGERXsAx630, https://github.com/threema-ch/threema-web
    - entropy: finger slide -> ThreemaID
    - Optional: Nickname, Phone, Email: wird als hash an Server gesendet
    - Sync über Server
    - Kontakte über ID Eingabe oder QR Code
- Jolocom   https://www.youtube.com/watch?v=OmOCNt8aXy8
    - entropy: 
        - finger slides on screen -> JolocomID
        - 12 word seed (generated from entropy)
- evernym   https://try.connect.me/, https://www.youtube.com/watch?v=HtU42fQhmpw
    - entropy:
- discord
    - username
    - i'm not a robot 
    - connect to server
        - claim account with verification email
        - password
- matrix: riot, element
    - username/password
    - connect to server 
    - email for backup
- tox   https://www.youtube.com/watch?v=453JECGRbGs
    - username/password
                  
Devices über DeviceID oder QR Code verbinden.
Backups
- Thatsme
- Export Vault, with passphrase
- Collection of QRCodes, with passphrase      

### Backup

- generate backup codes to reset "2FA" and attach new ones

## Devices
-> devices.md

Secure devices with PIN codes (not the keys itself!)

## Thoregon Identity

A storage in the distributed web 

Other identites can reference to this
-> e.g. thoregon:did:RHg54wKIloQJBJHxwUiKzCB

### Thatsme Identity

Additional behavior and storage 

## gun

Map gun users to Thoregon
--> no!


## Onlykey (FIDO)

Hardware tokens
- https://onlykey.io/de
- https://docs.crp.to/
- Howto videos: https://onlykey.io/pages/watch
 
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

- Authority generates key pair
- Pass it to the user 
    - discard the private key
- Create attest
- Identity creates an addition to the attest signed with the keypait
- Authority rechecks with the pub key if the key pair is used

Solutions with zero knowledge proofs
Homomorphic Encryption e.g. user supplies an encrypted seed

## Resolvers & Integrations

- https://github.com/peacekeeper/blockchain-identity
- https://www.heise.de/news/Gesetzentwurf-Online-Ausweis-soll-aufs-Handy-wird-aber-teuer-5049183.html


self contained multiformats
- thoregon id (soul)
- thoregon signed AES256 (384) symetric encrypted
- thoregon RSA  asymetric encrypted
