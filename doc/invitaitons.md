Invitations
===========

An SSI need to know the other SSI
- in own contact list
- in a public dictionary
- in a dictionary the SSI has a claim
- handle (id,key) sent by a messageing system
- QR code
- NFC
- written on a piece of paper 

An SSI can invite others to persistent resources
- entities
- services

Each SSI has a request queue where invitation requests
can be posted

The SSI creates a new key pair for the invitation request
and posts the request to the other SSIs request queue

The SSI has a wait queue where the pending requests are stored

An SSI can create a permit for other SSI (id, pubkey) and post
it the their request queues

An SSI must actively commit the permit to get access
to the resources

For each resource a claim is needed!

Send Inviations over other message systems
