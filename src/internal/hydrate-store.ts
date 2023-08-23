import { hasLocalStorage } from "../shared";

/**
 * Hydrates an entity from local storage if it exists and returns it.
 * If it doesn't exist, returns the fallback value.
 * 
 * @param storageKey Key to use for local storage
 * @param fallbackValue Value to return if no entity is found
 */
export function hydrateStore<T>(storageKey: string, fallbackValue: T): T

/**
 * Hydrates entities from local storage if they exist and returns them.
 * If they don't exist, returns the fallback value.
 * 
 * @param storageKey Key to use for local storage
 * @param fallbackValue Value to return if no entities are found
 * @returns 
 */
export function hydrateStore<T>(storageKey: string, fallbackValue: T[]): T[]

export function hydrateStore<T>(storageKey: string, fallbackValue: T | T[] = null): T | T[] {
	if (hasLocalStorage()) {
		const storedValue = window.localStorage.getItem(storageKey);

		if (storedValue) {
			try {
				const parsedValue = JSON.parse(storedValue);
                if (Array.isArray(fallbackValue)) {
                    return Object.values(parsedValue.byId);
                }
				return parsedValue;
			} catch {
				return fallbackValue;
			}
		}
		return fallbackValue;
	}
	return fallbackValue;
}