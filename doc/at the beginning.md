At the beginning
================

- create your own SSI
    - ? request queue, pending queue
    - ? message channel
    - receive some public entities
        - dorifer repositories
        - service queue adresses from thatsme
        - other published services
- select public entities
- add to public dictionaries
    - create for every entry
        - keypair with alias and id -> encrypt private key with main sync key
        - request queue, pending queue
        - message channel
- send invitation requests

## Create SSI

- start with the default app -> thatsme
- see public content
- invite to create a SSI
    - new matter root
    - new key pair
    - create sync main key -> use to encrypt private keys in the claims
    - select use of 
        - thatsme vault 
        - advanced users: use no password --> offline backup
            - 2FA, QR code, NFC, ...
    - verifications
        - passphrase (password)
        - email, phone, address, ...
    - create an ID: work(email+passphrase)

    - in case of vault
        - post to thatsme request queue: create vault 
            - ID
            - SSI entity (encrypted)
        - create an entity with ID 'work(email+passphrase)' as index ; also phone and other messenger id's can be registered
    - I will be public/not public
    - I want a Service Agent for backups
        - can be bought at any time

  LATER
    - 2FA Devices
        - onlykey
        - handy app
    - Wallet Apps
    - to put into a physical vault
        - QR code, also multiple QR codes e.g. 3 out of 5 needed to recover key
        - 12 words, split into multiple pieces 

Connect Devices
- login via vault
- QR code
- NFC
- message systems

Request the Keypair to connect the Device
- send request for service entry to the thatsme request queue
    - with work(email) as id for the queue
    - read entry point (service queue) 
    - answer service queue id and a challenge (encrypted with public key of SSI)
- ask for encrypted key pair
    - with response to challenge (signed with public key of SSI)
    - answer encrypted key pair
    
## Startup

### Globals defined at start

Global variables

- thoregon
- universe
- dorifer
- me
- device

Renames/Redefines

basic global variables will be redefined for every imported script for security.
only some objects and functions will be avialable  --> firewalls

- Browser: window (globalThis) and document 
    
On Node the global (globalThis) 
    

### Procedure

There exists a very simple DB interface to store data on the device. 
it is unified for browser and nodeJS --> baseDB

The baseDB is a simple key/value (object) store which is used as anchor
in the universe. It stores 
There is an implementation for nodeJS and browser environments (loaded via index.mjs or index.reliant.mjs)


#### Browser

- check if the device has is defined (has an id)
- if missing, create an id
- check if there is an SSI associated with this device and use it
- if missing, use the Ghost Identity

- connect all repos
    - dorifer
    - defined for this device
    - defined for the identity

- if there is an app refernced, start it
- if missing, start default app (thatsme)

This also applies to an [Electron Environment](https://www.electronjs.org/)
when it is used as installed user app

#### NodeJS

This typically is an installation to fulfill dedicated tasks.
It may be a service agent for an SSI or it processes 'background' service
tasks.

Therefore it runs on behalf of an SSI, which should be provided from the start.
It should never run with a Ghost Identity uness there is a reason.

The device represents the container, vm or server where the peer runs. The device id 
will also be generated at the very first start.   

## SSI API

Create


    Identiy
    async becomeSovereign()
    

