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
): (input: ID | T) => (state: Normalized<T>) => Normalized<T> {
    function withInput(id: ID): (state: Normalized<T>) => Normalized<T>
    function withInput(entity: T): (state: Normalized<T>) => Normalized<T>

    function withInput(input: ID | T) {
        return function fromState(state: Normalized<T>): Normalized<T> {
            let toActivate: T
            let toDeactivate: T[]

            const id = isID(input) ? input : getId(input)
            toActivate = getEntities<T>(id)(state)
            toDeactivate = getEntities<T>()(state).filter((e) => id !== getId(e))

            state = setEntities(getId)({ ...toActivate, active: true })(state)
            state = setEntities(getId)(
                toDeactivate.map((x) => {
                    return { ...x, active: false }
                }),
            )(state)

            return state
        }
    }

    return withInput
}
