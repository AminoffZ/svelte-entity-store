import { Readable, Subscriber, Unsubscriber, Updater, derived, writable } from 'svelte/store'
import { EntityStoreOptions, GetID, ID, Predicate } from './shared'
import { Normalized, normalize } from './internal/normalize'
import { removeEntities } from './internal/remove-entities'
import { setEntities } from './internal/set-entities'
import { updateEntities } from './internal/update-entities'
import { setActiveEntity } from './internal/set-active-entity'
import { getEntities } from './internal/get-entities'
import { getActiveEntity } from './internal/get-active-entity'
import { getActiveEntityId } from './internal/get-active-entity-id'
import { hydrateFromStore } from './internal/hydrate-from-store'
import { hydrateActiveId } from './internal/hydrate-active-id'
import { persistStore } from './internal/persist-store'

declare type Invalidator<T> = (value?: T) => void
declare type Subscribe<T> = (this: void, run: Subscriber<T>, invalidate?: Invalidator<T>) => Unsubscriber

/**
 * Simple Svelte store that normalized data by ID and provides helpers for common data access patterns.
 */
export type EntityStore<T> = {
    /**
     * Gets a derived store containing every entity in the store.
     *
     * @returns Array of all entities
     */
    get(): Readable<T[]>

    /**
     * Gets a derived store containing the entity if the ID is found, or undefined otherwise.
     *
     * @param id ID of the entity to find
     * @returns Entity object if found, undefined otherwise
     */
    get(id: ID): Readable<T | undefined>

    /**
     * Gets a derived store containing a list of all entities found by ID.
     * IDs that aren't found in the store are ignored. The list of entities is not guaranteed to be the same length as the list of IDs.
     *
     * @param ids Array of IDs to find
     * @returns Array of found entities
     */
    get(ids: ID[]): Readable<T[]>

    /**
     * Gets a derived store containing a list of all entities in the store that match
     * the filter function.
     *
     * @param pred Filter function
     * @returns Array of all entities matching the filter function
     */
    get(pred: Predicate<T>): Readable<T[]>

    /**
     * Gets the ID of the active entity.
     *
     * @returns ID of the active entity, undefined otherwise
     */
    getActiveId(): Readable<ID | undefined>

    /**
     * Gets the active entity.
     *
     * @returns Entitiy, undefined otherwise
     */
    getActive(): Readable<T | undefined>

    /**
     * Removes the entity from the store, if found.
     *
     * @param id {ID} ID of the entity to remove
     */
    remove(id: ID): void

    /**
     * Removes the given entities from the store, if found.
     *
     * @param ids Array of IDs to remove from the store
     */
    remove(ids: ID[]): void

    /**
     * Removes an entity from the store, if found.
     *
     * @param entity The entity to remove
     */
    remove(entity: T): void

    /**
     * Removes multiple entities from the store, if found.
     *
     * @param entities Array of entities to remove
     */
    remove(entities: T[]): void

    /**
     * Removes all entities that match the filter function.
     *
     * @param pred Filter function which returns true for each entity to be removed
     */
    remove(pred: Predicate<T>): void

    /**
     * Removes all entities from the store.
     */
    reset(): void

    /**
     * Adds the given entity to the store. If the entity is already in the store, their old value is replaced.
     *
     * @param entity Entity to be added or updated
     */
    set(entity: T): void

    /**
     * Adds the given entities to the store. For entities that are already in the store, their old value is replaced.
     *
     * @param entities Entity or entities to be added or updated
     */
    set(entities: T | T[]): void

    /**
     * Sets the active entity.
     *
     * @param id ID of the entity to set as active
     */
    setActive(id: ID): void

    /**
     * Sets the active entity.
     *
     * @param entity Entity to set as active
     */
    setActive(entity: T): void

    /**
     * See (Svelte's docs)[https://svelte.dev/docs#svelte_store] for details on the Store contract and `subscribe` function.
     */
    subscribe: Subscribe<Normalized<T>>

    /**
     * Runs every entity through the updater function and stores the new state.
     *
     * @param updater Callback to update the entity
     */
    update(updater: Updater<T>): void

    /**
     * If found, runs the entity through the updater function and stores the new state.
     *
     * @param updater Callback to update the entity
     * @param id ID of the entity to update
     */
    update(updater: Updater<T>, id: ID): void

    /**
     * Runs the matching entity through the updater function and stores the new state.
     *
     * @param updater Callback to update each entity
     * @param ids IDs of the entities to update
     */
    update(updater: Updater<T>, ids: ID[]): void

    /**
     * If found, runs the entity through the updater function and stores the new state.
     *
     * @param updater Callback to update the entity
     * @param entity The entity to update
     */
    update(updater: Updater<T>, entity: T): void

    /**
     * Runs each existing entity through the updater function and stores the new state.
     *
     * @param updater Callback to update each entity
     * @param entities Array of the entities to update
     */
    update(updater: Updater<T>, entities: T[]): void

    /**
     * Runs each matching entity through the updater function and stores the new state.
     *
     * @param updater Callback to update each entity
     * @param pred Filter function that returns true for each entity to update
     */
    update(updater: Updater<T>, pred: Predicate<T>): void
}

/**
 * Creates a new entity store.
 *
 * @typeParam T Entity type being stored
 * @param getID Function that returns the ID of an entity
 * @param initial (optional) Initial array of items to be stored
 */
function createEntityStore<T>(getID: GetID<T>, initial: T[], activeId?: ID) {
    const normalizeT = normalize(getID, activeId)
    const removeEntitiesT = removeEntities(getID)
    const setEntitiesT = setEntities(getID)
    const updateEntitiesT = updateEntities(getID)
    const setActiveEntityT = setActiveEntity(getID)

    const store = writable(normalizeT(initial))

    const reset = () => store.set(normalizeT([]))

    const set = (entities: T | T[]) => {
        const toAdd = [].concat(entities)

        if (toAdd.length > 0) {
            store.update(setEntitiesT(toAdd))
        }
    }

    function get(): Readable<T[]>
    function get(id: ID): Readable<T | undefined>
    function get(ids: ID[]): Readable<T[]>
    function get(pred: Predicate<T>): Readable<T[]>
    function get(input?: ID | ID[] | Predicate<T>): Readable<T | undefined> | Readable<T[]> {
        if (!input) {
            return derived(store, getEntities<T>())
        } else if (Array.isArray(input)) {
            return derived(store, getEntities<T>(input))
        } else if (input instanceof Function) {
            return derived(store, getEntities<T>(input))
        } else {
            return derived(store, getEntities<T>(input))
        }
    }

    function getActive(): Readable<T | undefined> {
        return derived(store, getActiveEntity<T>())
    }
    function getActiveId(): Readable<ID | undefined> {
        return derived(store, getActiveEntityId<T>())
    }

    function setActive(id: ID): void
    function setActive(entity: T): void
    function setActive(entity: ID | T): void {
        store.update(setActiveEntityT(entity))
    }

    function remove(id: ID): void
    function remove(ids: ID[]): void
    function remove(entity: T): void
    function remove(entity: T[]): void
    function remove(pred: Predicate<T>): void
    function remove(input: ID | ID[] | T | T[] | Predicate<T>): void {
        store.update(removeEntitiesT(input))
    }

    function update(updater: Updater<T>): void
    function update(updater: Updater<T>, id: ID): void
    function update(updater: Updater<T>, ids: ID[]): void
    function update(updater: Updater<T>, entity: T): void
    function update(updater: Updater<T>, entiites: T[]): void
    function update(updater: Updater<T>, pred: Predicate<T>): void
    function update(updater: Updater<T>, input?: ID | ID[] | T | T[] | Predicate<T>): void {
        store.update(updateEntitiesT(updater)(input))
    }

    return {
        get,
        remove,
        reset,
        set,
        subscribe: store.subscribe,
        update,
        getActive,
        getActiveId,
        setActive,
    }
}

/**
 * Creates a new entity store that persists to local storage.
 *
 * @typeParam T Entity type being stored
 * @param getID Function that returns the ID of an entity
 * @param initial (optional) Initial array of items to be stored
 * @param key Key to use for local storage
 * @returns Entity store
 */
function createPersistantEntityStore<T>(getID: GetID<T>, initial: T[] = [], key: string) {
    initial = hydrateFromStore<T>(key, initial)
    const activeId = hydrateActiveId<T>(key)
    const entityStore = createEntityStore<T>(getID, initial, activeId)
    persistStore<T>(entityStore, key)
    return entityStore
}

/**
 * Creates a new entity store.
 *
 * @typeParam T Entity type being stored
 * @param getID Function that returns the ID of an entity
 * @param initial (optional) Initial array of items to be stored
 * @param options (optional) Options for the store
 * @returns Entity store
 */
export function entityStore<T>(getID: GetID<T>, initial?: T[]): EntityStore<T>
export function entityStore<T>(getID: GetID<T>, options: EntityStoreOptions): EntityStore<T>
export function entityStore<T>(getID: GetID<T>, initial: T[], options: EntityStoreOptions): EntityStore<T>
export function entityStore<T>(
    getID: GetID<T>,
    initialOrOptions?: T[] | EntityStoreOptions,
    options?: EntityStoreOptions,
): EntityStore<T> {
    let initial: T[] = []
    try {
        if (Array.isArray(initialOrOptions)) {
            initial = initialOrOptions
        } else if (initialOrOptions) {
            options = initialOrOptions
        }
        if (options?.persist) {
            return createPersistantEntityStore<T>(getID, initial, options.storageKey)
        }
        return createEntityStore<T>(getID, initial)
    } catch (e) {
        // console.error(e)
        return
    }
}
