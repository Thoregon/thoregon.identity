/**
 * The Identity Controller provides an API to create and authenticate identities,
 * and it also provides a reflection if there is an identity authenticated
 *
 *   universe.Identity      ... controller
 *   universe.identity      ... identity reflection if authenticated
 *
 * @author: Bernhard Lukassen
 */

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

export default class Controller extends Reporter(EventEmitter) {

    /*
     * API
     */

    create() {

    }

    auth() {

    }

    leave() {

    }

    delete() {

    }

    get is() {

    }

    /*
     * Internal
     */

    init() {
        let user = universe.matter.user();
        this.handler = user;
        if (!!user.is) this.enter(user);
    }

    enter(user) {
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
