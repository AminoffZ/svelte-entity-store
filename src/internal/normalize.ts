import { GetID, ID } from '../shared'

/**
 * Normalized state tracking entities by ID
 */
export type Normalized<T> = {
    /**
     * Map of entities by ID. EntityStore supports `string` and `number` ID types
     */
    byId: {
        [id: string]: T
        [id: number]: T
    }
    /**
     * List of all entities IDs, sorted in the order they were added
     */
    allIds: ID[]
    /**
     * ID of the active entity
     */
    activeId?: ID | undefined
}

/**
 * Takes a list of elements and normalizes them by ID
 *
 * @typeParam T Entity type being stored
 * @param getID Function that returns the ID of an entity
 * @returns Noramlized state holding the given items
 */
export const normalize = <T>(getID: GetID<T>) => (items: T[]): Normalized<T> => {
    return items.reduce(
        ({ byId, allIds, activeId }, next) => {
            const id = getID(next)
            byId[id] = next
            allIds.push(id)

            return { byId, allIds, activeId }
        },
        { byId: {}, allIds: [], activeId: undefined } as Normalized<T>,
    )
}
