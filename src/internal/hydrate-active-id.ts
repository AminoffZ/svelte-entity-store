import { ID, hasLocalStorage } from '../shared'
import { Normalized } from './normalize'

/**
 * Loads the active ID from local storage if it exists and returns it.
 *
 * @param storageKey Key to use for local storage
 * @returns Active ID if it exists, otherwise undefined
 * @throws Error if the stored value cannot be parsed
 * @throws Error if the environment does not support local storage
 */
export function hydrateActiveId<T>(storageKey: string): ID {
    if (!hasLocalStorage()) throw new Error('Cannot load active ID in a non-browser environment')

    const storedValue = window.localStorage.getItem(storageKey)
    if (!storedValue) return

    try {
        const parsedValue: Normalized<T> = JSON.parse(storedValue)
        return parsedValue.activeId
    } catch {
        throw new Error('Could not parse stored value: ' + storedValue)
    }
}
