import { Normalized } from './normalize'

/**
 * Gets the active entity.
 * @returns Active Entity
 */
export function getActiveEntity<T>() {
    return function (state: Normalized<T>): T {
        return state.byId[state.activeId]
    }
}
