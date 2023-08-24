import type { GetID, ID } from '../shared'
import { isID } from '../shared'
import type { Normalized } from './normalize'

/**
 * Sets the active entity.
 * @returns State with the active entity set
 */
export function setActiveEntity<T>(getId: GetID<T>): (selector: ID | T) => (state: Normalized<T>) => Normalized<T> {
    function withSelector(id: ID): (state: Normalized<T>) => Normalized<T>
    function withSelector(entity: T): (state: Normalized<T>) => Normalized<T>

    function withSelector(input: ID | T) {
        return function fromState(state: Normalized<T>): Normalized<T> {
            const id = isID(input) ? input : getId(input)
            if (state.allIds.indexOf(id) === -1) return state
            return Object.assign({}, state, { activeId: id })
        }
    }

    return withSelector
}
