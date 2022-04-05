At the beginning
================

## Cases

### First Access

Create a ghost SSI
Access to global data
- repositories & directories from thoregon/thatsme
- other public directories
--> Claims at first access
    - join to read
    - or read claims attached automatically
        - join to 

### Trust Levels
- ghost/guest can read
- ghost/guest can write
- App/Widget needs SSI

typically an app works with SSI
widget typically works with guest 

### Existing Ghost 

get ghost settings

### Create SSI

- create keypairs and settings
    - ! 2FA device stores keys
- store on device
- keep signed on
- register in thatsme directory

apply public access claims to new SSI

### Existing SSI or from another device

Signon
- via thatsme directory
- via 2FA device
    - (e)SIM
    - onlykey
    - 

Connect with another device 
- via QR 
- via NFC

until then, a ghost exists

apply public access claims to new SSI (they are not stored in the SSI settings)


### SSI already signed on

- if a new app is opened, ask the user if the current SSI should connect

## Proc

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
    - is an SSI attached? use it
    - use GhostIdentity to attach galaxies
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
        
!! --> MFA Bombing: https://www.golem.de/news/lapsus-hackergruppe-umgeht-2fa-mit-einfachem-trick-2203-164236.html


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
- me (myself)
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
in the universe. It stores local data.
There is an implementation for nodeJS and browser environments (loaded via index.mjs or index.reliant.mjs)


#### Browser

- check if the device has is defined (has an id)
- if missing, create an id
- check if there is an SSI associated with this device and use it
- if missing, use the Ghost Identity
    - a ghost just fulfills the API need, but has no keypair(s) and no entry in any thatsme directory
    - ghost identites can't be invited and can't invite 
    - a ghost has only access to the thoregon/thatsme public dictionaries
- if an app needs more information about the user, e.g. 'nickname' a Guest Identity is created out of the Ghost
    - a guest can be invited to the providers content
- Or a Hosted Identity is required by the app 
- If the user wants to become souvereign, he can initiate an SSI and reuse the settings from his current identiy (ghost, guest, hosted)

- connect 'galaxies'
    - 'ammandul' for repositories
        
- connect all repos
    - dev repo if in dev mode
    - dorifer -> ammandul
    - defined for this device
    - defined for the identity
- referenced schemas must exist in any repo defined
    - example reference to a schema: /ammandul/thoregon.identity/identity

- if there is an app refernced, start it
- if missing, start default app (thatsme)

This also applies to an [Electron Environment](https://www.electronjs.org/)
when it is used as installed user app

#### NodeJS

called (service) agent

This typically is an installation to fulfill dedicated tasks.
It may be a service agent for an SSI or it processes 'background' service
tasks.

Therefore it runs on behalf of an SSI, which should be provided from the start.
It should never run with a Ghost Identity unless there is a reason.

Possibilities to run an agent:

The identity key pairs are provided in the config, signon the identity in the dawn hook.
Use only for testing. those keys can easily be stolen. 

The identity will be retrieved from a vault. To unlock the vault
the agent listens to a queue where the 'owner' can send the passphrase for the vault

The agent sends a signon request to its owner SSI. each agent has its own request queue
on the SSI.
  
The device represents the container, vm or server where the peer runs. The device id 
will also be generated at the very first start.   

In an agent typlically services are running on behalf of the owner

Services can work together in circles 

--> see  wiki/serviceagent.md for the structure

## SSI API

Create


    Identiy
    async becomeSovereign()
    

## Acccess

- introduce shared entities (like OSX  /Users/Shared)
     
    
## Apps/Components

- each app/component has its own context
- the persistent root is defined by the namespace of the context, mostly the name of the app
- within this namespace the app/component can define its galaxies
- apps/components can request access to other namespaces
- read access to some namespaces - thoregon, thatsme - is granted by default  


## Persistence

- entry metadata
    - system classes (like Credential): always known, available in the 'thoregon' package(s)
    - reference to a repository: repo/component/library/class 
    
 
