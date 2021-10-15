/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import IdentityResolver      from "./identityresolver.mjs";
import { ErrNotImplemented } from "../errors.mjs";
import { doAsync, timeout }  from "/evolux.universe";
import Base64url             from "/evolux.util/lib/base64url.mjs";
import SEA                   from "/evolux.everblack/lib/crypto/sea.mjs";

import { ErrProviderNotReady, ErrProviderOccupied } from "./errors.mjs";

const T     = universe.T;
const PXAES = 'TS';      // thoregon symetric AES encrypted

export default class GunIdentityResolver extends IdentityResolver {



    /**
     * check if there exists anything on this root
     * must be version independent
     * @param ssiroot
     * @return {Promise<boolean>}
     */
    static async occupied(ssiroot) {
        let entity = await universe.gun.get(ssiroot);
        if (!entity) {      // workaround, get rid of
            await timeout(300);
            entity = await universe.gun.get(ssiroot);
        }
        return !!entity;
    }

    async createEntity(identity) {
        if (this.entity) throw ErrProviderOccupied();
        this.entity    = identity;
        this.persister = CURRENTPERSISTER;
        this.groupmap  = {};
        this.groups    = {};
        if (!this.salt) this.salt = universe.random();
        return await CURRENTPERSISTER.createEntity(this.ssiroot, this.spub, this.salt, identity, this.groupmap, this.encrypt, this.decrypt);
    }

    async modifyEntity(identity) {
        if (!this.entity) throw ErrProviderNotReady();
        this.entity = identity || this.entity;
        return await this.persister.modifyEntity(this.ssiroot, this.spub, this.salt, this.entity, this.groupmap, this.encrypt, this.decrypt);
    }

    async deleteEntity() {
        if (!this.entity) throw ErrProviderNotReady();
        return await CURRENTPERSISTER.deleteEntity(this.ssiroot, this.spub, this.salt, this.encrypt, this.decrypt);
    }

    async getEntity() {
        // todo [OPEN]: switch provider version for stored entity
        const entry = await CURRENTPERSISTER.getEntity(this.ssiroot, this.spub, this.encrypt, this.decrypt);
        if (!entry) return;
        this.entity = { ...entry.entity };
        this.persister = CURRENTPERSISTER;
        this.salt      = entry.salt;
        this.groupmap  = entry.groups;
        this.groups    = {};
        return entry.entity;
    }

    async getItem(group, name) {
        if (!this.entity) throw ErrProviderNotReady();
        let item = this._getItem(group, name);
        if (!item) {
            let egroup = this.groupmap[group];
            if (!egroup) egroup = this.groupmap[group] = { _: universe.random(9), $: {} };
            let ename = egroup.$[name];
            if (!ename) ename = egroup.$[name] = universe.random(9);
            item = await this.persister.getItem(this.ssiroot, this.spub, this.salt, egroup._, ename, this.encrypt, this.decrypt);
            this._setItem(group, name, item);
        }
        return item;
    }

    async setItem(group, name, item) {
        if (!this.entity) throw ErrProviderNotReady();
        let modfied = false;
        let egroup = this.groupmap[group];
        if (!egroup) {
            egroup = this.groupmap[group] = { _: universe.random(9), $: {} };
            modfied = true;
        }
        let ename = egroup.$[name];
        if (!ename) {
            ename = egroup.$[name] = universe.random(9);
            modfied = true;
        }
        this._setItem(group, name, item); // todo [OPEN]: send modification event, or let the db event modify
        await this.modifyEntity();
        return await this.persister.setItem(this.ssiroot, this.spub, this.salt, egroup._, ename, item, this.encrypt, this.decrypt);
    }

    async removeItem(group, name) {
        return await this.setItem(group, name);
    }

    async getGroupNames() {
        if (!this.entity) throw ErrProviderNotReady();
        return Object.keys(this.groupmap)
    }

    async getItemNames(group) {
        if (!this.entity) throw ErrProviderNotReady();
        return Object.keys(this.groupmap[group]) || [];
    }

    release() {
        delete this.entity;
        delete this.persister;
        delete this.groups;
        this.persister?.release(this.ssiroot, this.entity);
    }

    //
    // helper
    //

    _getItem(group, name) {
        return (this.groups[group] && this.groups[group][name]) ? this.groups[group][name] : undefined;
    }

    _setItem(group, name, item) {
        let ge= this.groups[group];
        if (!ge) ge = this.groups[group] = {};
        ge[name] = item;
    }

    _groupitems() {

    }
}

const PERSISTER_VERSION = '21_1';

const IdentityPersister$21_1 = {

    async createEntity(ssiroot, spub, salt, identity, groups, encrypt, decrypt) {
        const genc = await encrypt(groups, salt);
        const ienc = await encrypt(identity, salt);
        const entry = {
            [T]: PXAES,
            v: PERSISTER_VERSION,
            p: spub,
            s: salt,
            g: JSON.stringify(genc),
            c: JSON.stringify(ienc)
        };
        universe.matter[ssiroot] = { [T]: JSON.stringify(entry) } ;
        // await doAsync();
        return true;
    },

    async modifyEntity(ssiroot, spub, salt, identity, groups, encrypt, decrypt) {
        // todo <SEC>: check if the current entity is has signature from same SSI
        const genc = await encrypt(groups, salt);
        const ienc = await encrypt(identity, salt);
        const entry = {
            [T]: PXAES,
            v: PERSISTER_VERSION,
            p: spub,
            s: salt,
            g: JSON.stringify(genc),
            c: JSON.stringify(ienc)
        };
        universe.matter[ssiroot] = { [T]: JSON.stringify(entry) };
        // await doAsync();
        return true;
    },

    async deleteEntity(ssiroot, spub, salt, identity, encrypt, decrypt) {
        // todo [OPEN]
    },

    async getEntity(ssiroot, spub, encrypt, decrypt) {
        let entry = await universe.matter[ssiroot].val;
        if (!entry) return;
        entry = JSON.parse(entry[T]);
        let entity;
        if (!entry.p === spub) return;
        if (entry[T] === PXAES) {
            // todo: switch version -> entry.v
            const salt = entry.s;
            const decrypted = await decrypt(JSON.parse(entry.c), salt);
            if (decrypted) {
                entity = {
                    salt,
                    entity: decrypted,
                    groups: await decrypt(JSON.parse(entry.g), salt)
                }
            }
        } else {
            // todo [OPEN]: uses 'multiformat' -> https://github.com/multiformats/js-multiformats
        }
        return entity;
    },

    async getItem(ssiroot, spub, salt, group, name, encrypt, decrypt) {
        let   eitem  = await universe.matter[ssiroot].i[group][name].val;
        if (!eitem) return;
        eitem = JSON.parse(eitem);
        // const salt = eitem.salt;
        const item = await decrypt(JSON.parse(eitem.c), salt);
        return item;
    },

    async setItem(ssiroot, spub, salt, group, name, item, encrypt, decrypt) {
        const eitem  = await encrypt(item, salt);
        universe.matter[ssiroot].i[group][name] = JSON.stringify({
            p: spub,
            s: salt,
            c: JSON.stringify(eitem)
        });
    },

    subscribe(ssiroot, handler) {

    },

    release() {

    }
}

const CURRENTPERSISTER = IdentityPersister$21_1;
