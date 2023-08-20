import type { Entity, GetID, ID } from '../shared'
import { isID } from '../shared'
import { getEntities } from './get-entities'
import type { Normalized } from './normalize'
import { setEntities } from './set-entities'

/**
 * Sets the active entity. The active entity is the entity with the `active` property set to `true`.
 * Unsets the active property of all other entities.
 * @returns State with the active entity set
 */
export function setActiveEntity<T extends Entity>(
    getId: GetID<T>,
): (selector: ID | T) => (state: Normalized<T>) => Normalized<T> {
    function withInput(id: ID): (state: Normalized<T>) => Normalized<T>
    function withInput(entity: T): (state: Normalized<T>) => Normalized<T>

    function withInput(input: ID | T) {
        return function fromState(state: Normalized<T>): Normalized<T> {
            let toUpdate: T[]
            toUpdate = getEntities<T>()(state)
            const idToActivate = isID(input) ? input : getId(input)
            return toUpdate.reduce(({ byId, allIds, activeId }, next) => {
                const id = getId(next)
                if (idToActivate === id) {
                    activeId = idToActivate
                }

                return {
                    byId: {
                        ...byId,
                        [id]: setActiveUpdater(next, idToActivate),
                    },
                    allIds,
                    activeId,
                }
            }, state)
        }
    }

    return withInput
}

function setActiveUpdater<T extends Entity>(value: T, idToActivate: ID): T {
    if (value.id === idToActivate)
        return {
            ...value,
            active: true,
        }
    if (value.active) return { ...value, active: false }
    return value
}
