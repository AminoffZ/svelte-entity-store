import { EntityStore } from "../entity-store";
import { hasLocalStorage } from "../shared";
import { Normalized } from "./normalize";

/**
 * Persists the store to local storage
 * 
 * @param store Store to persist
 * @param storageKey Key to use for local storage
 * @returns {void}
 */
export function persistStore<T>(store: EntityStore<T>, storageKey: string) {
	if (!hasLocalStorage()) throw new Error('Cannot persist store in a non-browser environment');
	store.subscribe((value: Normalized<T>) => {
		let storageValue = JSON.stringify(value);
		window.localStorage.setItem(storageKey, storageValue);
	});
	return;
}
	

