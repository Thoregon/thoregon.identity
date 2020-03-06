/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }                  from "/evolux.universe";
import { isFunction, forEach }      from "/evolux.util";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";
// import { RepoMirror }               from "/evolux.util";

export default class Registry extends Reporter(EventEmitter) {

    constructor() {
        super();
    }


    userWithAlias(alias) {

    }

    user(publickey) {

    }

    create(alias, )
}
