/**
 * The Identity Controller provides an API to create and authenticate identities,
 * and it also provides a reflection if there is an identity authenticated
 *
 * This class is named controller, not repository, Because it does not provide its own collection
 * It uses the underlying distributed identities and provides an API
 *
 *   universe.Identity      ... controller
 *   universe.identity      ... identity reflection if authenticated
 *
 * todo: pulgins for other self souvereign identity systems
 *
 * @author: Bernhard Lukassen
 */

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import IdentityReflection           from "./identityreflection.mjs";

export default class Controller extends Reporter(EventEmitter) {

    /*
     * API
     */

    create(alias, passphrase) {
        return new Promise((resolve, reject) => {
            let user = universe.matter.user();
            user.create(alias, passphrase, (res) => {
                if (res.err) reject(res.err);
                resolve(true);
            })
        })
    }

    auth(identity, passphrase) {
        return new Promise((resolve, reject) => {
            let user = universe.matter.user();
            user.auth(identity, passphrase, (res) => {
                if (res.err) reject(res.err);
                this.signon(user);
                resolve(true);
            })
        })
    }

    leave() {
        return new Promise((resolve, reject) => {
            let user = universe.matter.user();
            if (user.is) {
                user.leave();
                this.signoff(user);
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }

    delete() {
        return new Promise((resolve, reject) => {
            let user = universe.matter.user();
            if (user.is) this.signoff(user);
            user.delete(identity, passphrase, (res) => {
                if (res.err) reject(res.err);
                resolve(true);
            })
        })
    }

    get is() {

    }

    /*
     * Internal
     */

    init() {
        let user = universe.matter.user();
        this.handler = user;
        if (!!user.is) this.signon(user);
    }

    signon(user) {
        // create an identity reflection
        let identity = new IdentityReflection({ anchor: user });
        universe.identity = identity;
        this.emit('auth', identity);
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'Identity controller ready',
            exit:           'Identity controller exit',
            created:        'an identity was created',
            auth:           'an identity has authenticated',
            leave:          'an identity has logged out',
            delete:         'an identity has been deleted'
        };
    }

    /*
     * service implementation
     */

    install() {}
    uninstall() {}
    resolve() {}
    start() {
        this.init();
        universe.Identity = this;   // publish identity controller
        this.emit('ready', { identitycontroller: this });
    }
    stop() {
        delete universe.Identity;
        this.emit('exit', { identitycontroller: this });
    }

    update() {}

}
