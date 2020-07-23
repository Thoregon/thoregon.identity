/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { forEach }              from '/evolux.util';
import { doAsync }              from '/evolux.universe';

const listeners = [];

const rnd       = universe.random;
const everblack = universe.Gun.SEA;

export default class GunIdentity {

    get did() {

    }

    static get root() {
        return universe.matter.user();
    }

    get root() {
        return this.constructor.root;
    }

    prettyprint() {
        let user = this.root;
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
        let user = this.root;
        return new Promise((resolve, reject) => {
            user.create(alias, passphrase, (res) => {
                if (res.err) reject(res.err);
                resolve();
            })
        })
    }

    static auth(identity, passphrase) {
        let user = this.root;
        return new Promise((resolve, reject) => {
            user.auth(identity, passphrase, (res) => {
                if (res.err) reject(res.err);
                resolve();
            })
        })
    }

    leave() {
        let user = this.root;
        return new Promise((resolve, reject) => {
            if (user.is) {
                user.leave();
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }

    delete() {
        let user = this.root;
        return new Promise((resolve, reject) => {
            user.delete(identity, passphrase, (res) => {
                if (res.err) reject(res.err);
                resolve(true);
            })
        })
    }

    get is() {
        return this.root.is;
    }

    get alias() {
        return this.root.is.alias;
    }

    /*
     * Keys
     */

    get pub() {
        return this.root.is.pub;
    }

    get epub() {
        return this.root.is.epub;
    }

    /**
     * provide a public key to get a shared secret with this identity
     * @param epub - encryption public key
     */
    async sharedSecret(epub) {
        // todo [REFACTOR]: the keypair from the user will not public accessible in future
        return everblack.secret(epub, this.root._.sea);
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
