/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { forEach }              from '/evolux.util';
import { doAsync }              from '/evolux.universe';

const listeners = [];

export default class GunIdentity {

    get did() {

    }

    prettyprint() {
        let user = universe.matter.user();
        let id = user.is;
        return id ? id.alias : '<unknown>';
    }

    /*
     * identity adapter implementation
     */

    static init(opt) {
        universe.gun.on('auth', (ack) => this.signon(ack));
    }

    static create(alias, passphrase) {
        return new Promise((resolve, reject) => {
            let user = universe.matter.user();
            user.create(alias, passphrase, (res) => {
                if (res.err) reject(res.err);
                resolve();
            })
        })
    }

    static auth(identity, passphrase) {
        return new Promise((resolve, reject) => {
            let user = universe.matter.user();
            user.auth(identity, passphrase, (res) => {
                if (res.err) reject(res.err);
                resolve();
            })
        })
    }

    leave() {
        return new Promise((resolve, reject) => {
            let user = universe.matter.user();
            if (user.is) {
                user.leave();
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }

    delete() {
        return new Promise((resolve, reject) => {
            let user = this.user;
            user.delete(identity, passphrase, (res) => {
                if (res.err) reject(res.err);
                resolve(true);
            })
        })
    }

    get is() {
        return this.user.is;
    }

    /*
     * listeners
     * todo: remove listener
     */

    static addListener(listener) {
        listeners.push(listener);
    }

    static async signon(ack) {
        doAsync();
        let adapter = new this();
        await forEach(listeners, async (listener) => {
            listener(adapter);
        });
    }

}
