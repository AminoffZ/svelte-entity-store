<img width="192" height="192" src="https://raw.githubusercontent.com/AminoffZ/svelte-entity-store/main/assets/images/icon.svg" align="right" />

# Svelte Entity Store
A (**w**ork-**i**n-**p**rogress) generic entity store for Svelte projects.

Check out the [full docs](https://aminoffz.github.io/svelte-entity-store) for details.

## This Fork 🍴

Updated to work with latest version of SvelteKit (tested and working on 4.0.5).
Added activeId to allow setting and reading an "active" entity similar to [akita](https://opensource.salesforce.com/akita/docs/entities/active/).
Added persistency option to allow storing the stores in localStorage.
Expose hydration and peristance methods from and to localstorage to allow custom storage solutions decoupled from the entity pattern.

## Why?

This is ultimately just a [custom store](https://svelte.dev/examples/custom-stores) built on top of [svelte/store](https://svelte.dev/docs/svelte-store). Like the rest of Svelte, the built in stores are excellent building blocks that aim to give you all the tools you need without trying to solve every single scenario out of the box.

The goal with `svelte-entity-store` is to provide a simple, generic solution for storing collections of entity objects. Throwing an array of items into a basic `writeble` store doesn't scale well if you have a lot of items and need to quickly find or update one item in the store.

## Install

```
npm install https://github.com/AminoffZ/svelte-entity-store/releases/download/v1.0.8/svelte-entity-store-1.0.8.tgz
```

## Usage

```ts
<script lang="ts">
  import { entityStore } from 'svelte-entity-store'

  // Define your entity interface
  interface TodoItem {
    id: string
    description: string
    completed: boolean
  }

  // Write a getter function that returns the ID of an entity (can be inlined in the constructor also)
  // Currently number and string values are valid IDs
  const getId = (todo: TodoItem) => todo.id

  // Initialize the store
  // (optional) the constructor accepts an Array as a second param
  //            ex: if you rehydrate state from localstorage
  const store = entityStore<TodoItem>(getId)

  // Get a derived store for every active todo
  const activeTodos = store.get((todo) => todo.completed)

  // toggle a todo
  function toggle(id: string) {
    store.update((todo) => ({ ...todo, completed: !todo.completed }), id)
  }

  // clear completed todos
  function clearCompleted() {
    store.remove((todo) => todo.completed)
  }
</script>

{#each $activeTodos as todo (todo.id) }
  // ... render your UI as usual
{/each}
```

Without the entity pattern:

```typescript
// src/lib/shared/stores/audio.store.ts

import { writable } from 'svelte/store'
import { hydrateFromStore, persistStore } from 'svelte-entity-store'

export type AudioSettings = {
    master: number
    music: number
    sfx: number
}

const init: AudioSettings = {
    master: 100,
    music: 100,
    sfx: 100,
}

const hydrated = hydrateFromStore('audioSettings', init)

const audioSettings = writable(hydrated)

persistStore(audioSettings, 'audioSettings')

export default audioSettings
```

## API

### entityStore.get

Gets a [derived store](https://svelte.dev/docs#derived) to subscribe to one or more entity in the store.

Be careful with how many derived stores you create. It's best to use `entityStore.get` at the page or view level and pass state down to _dumb_ components.

i.e. If the TodoMVC app has 10,000 todos in it and each list item is a separate component calling `entityStore.get(id)` the performance and memory use will be a nightmare. Just don't do it. You've been warned!

#### get()

Gets an array with every entity in the store.

#### get(id: ID)

Gets the entity by ID, or undefined if it isn't found.

#### get(ids: ID[])

Gets an array of specific entities by ID. IDs will be ignored if they aren't found in the store - the array of entities returned may not be the same length as the `ids` array provided.

#### getActive()

Gets the active entity.

#### getActiveId()

Gets the ID of the active entity.

#### get(pred: Predicate<T>)

Gets every entity that matches the predicate - the equivalent of `Array.prototype.filter()`

### entityStore.remove

Removes one or more entities from the store.

#### remove(id: ID)

Removes a specific entity by ID, if it exists

#### remove(ids: ID[])

Removes one or more entity by ID

#### remove(pred: Predicate<T>)

Removes every entity that matches the predicate. Note that this removes an entity if the predicate returns **true**!

### reset

Removes all entities, resetting the entity store to it's original default state

### entityStore.set

Adds or replaces entities in the store. Note that `set` will override any old state of an entity if it already existed in the store. Use `entityStore.update` if you want to modify the entity instead.

#### set(entity: T)

Adds entity to the store, or replaces the old state if it already exists.

#### set(entities: T[])

Works just like `set(entity: T)`, but for each item in the array. This is useful when you ened to update more than one entity and don't want to trigger subscribers until all entities are added.

#### setActiveEntity(entity: T)

Sets the active entity, takes the entity to set as active as an argument.

#### setActiveEntity(id: ID)

Sets the active entity with its id as an argument.

### entityStore.subscribe

The `subscribe` method for the entire store, see [Svelte's docs](https://svelte.dev/docs#svelte_store) for more details on the subscribe API.

You really shouldn't need to use this subscribe method unless you're tying the entire store into `devtools` or logging.

### entityStore.update

Updates one or more entity in the store.

This follows the same basic design as [writable stores](https://svelte.dev/examples#writable-stores) - rather than providing the new entity state you give a callback function that will be given the old entity and returns the new, updated entity.

#### update(updater: (entity:T ) => T)

Runs every entity in the store through the `updater` callback. Check out the ('/examples/todomvc')[/examples/todomvc] project, this is used for the "toggle all todos" feature.

#### update(updater: (entity: T) => T, id: ID)

Runs a specific entity through the updater callback. `updater` will never be called if the entity isn't found in the store.

#### update(updater: (entity: T) => T, ids: ID[])

Runs multiple entities through the updater function. This is useful when you ened to update more than one entity and don't want to trigger subscribers until all entities are updated.

#### update(updater: (entity: T) => T, entity: T)

Convenience override in case your code is already using the entire entity, avoids having to do something like `update(toggle, todo.id)`.

#### update(updater: (entity: T) => T, entities: T[])

Works just like `update(updater, entities: T[])`, but for each item in the array. This is useful when you ened to update more than one entity and don't want to trigger subscribers until all entities are added.

#### update(updater: (entity: T) => T, pred: Predicate<T>)

Runs every entity that matches the predicate through the `updater` callback. The predicate works just like `Array.prototype.filter`, every entity is run through the predicate and if it returns **true** the entity is updated.

### hydrateFromStore<T>(storageKey: string, fallbackValue: T): T

Hydrates the store from localStorage. If no value is found in localStorage, the fallbackValue is returned. This is useful when you want to hydrate an empty store without the entity pattern.

### hydrateFromStore<T>(storageKey: string, fallbackValue: T[]): T[]

Hydrates the store from localStorage. If no value is found in localStorage, the fallbackValue is returned. This is useful when you want to hydrate an empty store with entities.

### persistStore<T, S extends Writable<T>>(store: S, storageKey: string)

Persists the store to localStorage. This is useful when you want to persist the store without the entity pattern.
