import { Entity, ID } from '../shared'
import { Normalized } from './normalize'

/**
 * Gets the ID of the active entity. The active entity is the entity with the `active` property set to `true`.
 * @returns ID of the active entity
 */
export function getActiveEntityId<T extends Entity>() {
    return function (state: Normalized<T>): ID {
        return state?.activeId
    }
}
