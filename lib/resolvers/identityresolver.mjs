/**
 * Resolve and store and SSI
 *
 * todo [OPEN]
 *  - listen to changes on the stored SSI entry and the collections
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

// import { EventEmitter } from "/evolux.pubsub";

export default class IdentityResolver /*extends EventEmitter*/ {

    constructor({ ssiroot, spub, encrypt, decrypt } = {}) {
        // super();
        Object.assign(this, { ssiroot, spub, encrypt, decrypt });
    }

    static async occupied(ssiroot) {
        return false;
    }

    static for({ ssiroot, spub, encrypt, decrypt } = {}) {
        const resolver = new this({ ssiroot, spub, encrypt, decrypt });
        return resolver;
    }

    async createEntity(spub, salt, identity) {
        throw universe.ErrNotImplemented('IdentityResolver.createEntry');
    }

    async modifyEntity(identity) {
        throw universe.ErrNotImplemented('IdentityResolver.modifyEntry');
    }

    async deleteEntity() {
        // delete all items also
        throw universe.ErrNotImplemented('IdentityResolver.modifyEntry');
    }

    async getEntity() {
        throw universe.ErrNotImplemented('IdentityResolver.getEntry');
    }

    async getItem(group, name) {
        throw universe.ErrNotImplemented('IdentityResolver.getCredential');
    }

    async setItem(group, name, item) {
        throw universe.ErrNotImplemented('IdentityResolver.setCredential');
    }

    async removeItem(group, name) {
        throw universe.ErrNotImplemented('IdentityResolver.setCredential');
    }

    async getGroupNames() {
        throw universe.ErrNotImplemented('IdentityResolver.getGroupNames');
    }

    async getItemNames(group) {
        throw universe.ErrNotImplemented('IdentityResolver.getGroupNames');
    }

    //
    // modification listeners
    //

    release() {
        // implement by subclass
    }

    subscribe(fn) {
        // implement by subclass
    }

    //
    // EventEmitter implementation
    //

/*
    get publishes() {
        return {
            entityCreated:  'Identity created',
            entityModified:  'Identity modified',
            entityDeleted:  'Identity deleted',
            itemCreated:  'Identity item created',
            itemModified:  'Identity item modified',
            itemRemoved:  'Identity item removed',
        };
    }
*/

}
