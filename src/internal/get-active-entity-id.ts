import { ID } from '../shared'
import { Normalized } from './normalize'

/**
 * Gets the ID of the active entity.
 *
 * @returns ID of the active entity
 */
export function getActiveEntityId<T>() {
    return function (state: Normalized<T>): ID {
        return state?.activeId
    }
}
