import type { Entity, GetID } from '../shared'
import type { Normalized } from './normalize'

/**
 * Adds or updates the given entities to the normalized state. Entities already in the state or replaced, new entities are added.
 */
export const setEntities = <T extends Entity>(getId: GetID<T>) => (items: T | T[]) => (
    state: Normalized<T>,
): Normalized<T> => {
    return [].concat(items).reduce(({ byId, allIds, activeId }, next) => {
        const id = getId(next)
        const exists = id in byId
        if (next?.active) {
            activeId = id
        }
        return {
            byId: { ...byId, [id]: next },
            allIds: exists ? allIds : allIds.concat(id),
            activeId,
        }
    }, state)
}
