import { Entity } from '../shared'
import { Normalized } from './normalize'

/**
 * Gets the active entity. The active entity is the entity with the `active` property set to `true`.
 * @returns Active Entity
 */
export function getActiveEntity<T extends Entity>() {
    return function (state: Normalized<T>): T {
        return state.byId[state.activeId]
    }
}
