import { Writable } from 'svelte/store'
import { hasLocalStorage } from '../shared'

/**
 * Persists the store to local storage
 *
 * @param store Store to persist
 * @param storageKey Key to use for local storage
 * @returns {void}
 */
export function persistStore<T, S extends Writable<T>>(store: S, storageKey: string) {
    if (!hasLocalStorage()) throw new Error('Cannot persist store in a non-browser environment')
    store.subscribe((value) => {
        const storageValue = JSON.stringify(value)
        window.localStorage.setItem(storageKey, storageValue)
    })
    return
}
