import type { Normalized } from './normalize'
import type { Entity, ID, Predicate } from '../shared'

/**
 * Gets an array of all entities in the state
 */
export function getEntities<T extends Entity>(): (state: Normalized<T>) => T[]

/**
 * Finds an entity by ID
 *
 * @param id ID of the entity to find
 * @returns Entity object if found, undefined otherwise
 */
export function getEntities<T extends Entity>(id: ID): (state: Normalized<T>) => T | undefined

/**
 * Finds multiple entities by ID. Note that IDs will be ignored if the entity isn't found,
 * the array returned may not be the same length as the input array.
 *
 * @param ids Array of IDs to find
 * @returns Array of found entities
 */
export function getEntities<T extends Entity>(ids: ID[]): (state: Normalized<T>) => T[]

/**
 * Finds all entities that match the filter function.
 *
 * @param pred Filter function
 * @returns Array of entities matching the filter function
 */
export function getEntities<T extends Entity>(pred: Predicate<T>): (state: Normalized<T>) => T[]

export function getEntities<T extends Entity>(input?: ID | ID[] | Predicate<T>) {
    return function (state: Normalized<T>): T | T[] {
        if (!input) {
            return state.allIds.map((id) => state.byId[id])
        } else if (Array.isArray(input)) {
            return input.map((id) => state.byId[id]).filter(Boolean)
        } else if (input instanceof Function) {
            return state.allIds.map((id) => state.byId[id]).filter(input)
        } else {
            return state.byId[input]
        }
    }
}
