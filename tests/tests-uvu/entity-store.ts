import { get as svelteGet } from 'svelte/store'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { entityStore } from '../../src'
import { Normalized } from '../../src/internal/normalize'

type TestEntity = {
    id: string
    description: string
    completed: boolean
}

const getID = (e: TestEntity) => e.id
const isCompleted = (e: TestEntity) => e.completed
const toggle = (e: TestEntity) => ({ ...e, completed: !e.completed })

// ---

const constructor = suite('constructor')

constructor('is a function', () => {
    assert.type(entityStore, 'function')
})

constructor('returns a subscriber function', () => {
    const store = entityStore<TestEntity>(getID)

    assert.type(store, 'object')
    assert.type(store.subscribe, 'function')
})

constructor("doesn't require initial state", () => {
    const store = entityStore<TestEntity>(getID)
    const state = svelteGet(store)

    assert.equal(state, {
        byId: {},
        allIds: [],
        activeId: undefined,
    })
})

constructor('normalizes initial items array', () => {
    const items: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<TestEntity>(getID, items)
    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: items[0],
            def: items[1],
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})

constructor.run()

// ---

const reset = suite('reset')

reset('is a function', () => {
    const { reset } = entityStore<TestEntity>(getID)
    assert.type(reset, 'function')
})

reset('noop for an empty store', () => {
    const store = entityStore<TestEntity>(getID)
    store.reset()

    const state = svelteGet(store)

    assert.equal(state, { byId: {}, allIds: [] })
})

reset('removes all existing entities', () => {
    const items: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<TestEntity>(getID, items)
    store.reset()

    const state = svelteGet(store)

    assert.equal(state, { byId: {}, allIds: [], activeId: undefined })
})

reset("doesn't trigger subscribers for empty store", () => {
    const store = entityStore<TestEntity>(getID)

    let states: Normalized<TestEntity>[]
    const unsubscribe = store.subscribe((state) => states.push(state))

    store.reset()
    //@ts-ignore
    assert.is(states.length, 1)

    unsubscribe()
})

// ---

const set = suite('set')

set('is a function', () => {
    const { set } = entityStore<TestEntity>(getID)
    assert.type(set, 'function')
})

set('accepts a single entity', () => {
    const store = entityStore<TestEntity>(getID)
    const entity: TestEntity = { id: 'abc', description: 'item 1', completed: false }

    store.set(entity)

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: entity,
        },
        allIds: ['abc'],
        activeId: undefined,
    })
})

set('accepts an array of entities', () => {
    const store = entityStore<TestEntity>(getID)
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]

    store.set(entities)

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: entities[0],
            def: entities[1],
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})

set('updates an existing entity', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.set({ ...entities[0], completed: true })

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: { ...entities[0], completed: true },
            def: entities[1],
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})

set('handles a combination of new and existing entities', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    const input: TestEntity[] = [
        { ...entities[0], completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]

    store.set(input)

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: { ...entities[0], completed: true },
            def: entities[1],
            ghi: input[1],
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

set('calls subscribers once after all entities are updated', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    const input: TestEntity[] = [
        { ...entities[0], completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]

    const states: Normalized<TestEntity>[] = []
    const unsubscribe = store.subscribe((state) => states.push(state))

    store.set(input)

    assert.equal(states, [
        {
            byId: {
                abc: entities[0],
                def: entities[1],
            },
            allIds: ['abc', 'def'],
            activeId: undefined,
        },
        {
            byId: {
                abc: { ...entities[0], completed: true },
                def: entities[1],
                ghi: input[1],
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        },
    ])

    unsubscribe()
})

set("doesn't call subscribers if an empty array was provided", () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    const states: Normalized<TestEntity>[] = []
    const unsubscribe = store.subscribe((state) => states.push(state))

    store.set([])

    assert.equal(states, [
        {
            byId: {
                abc: entities[0],
                def: entities[1],
            },
            allIds: ['abc', 'def'],
            activeId: undefined,
        },
    ])

    unsubscribe()
})

set.run()

// ---

const get = suite('get')

get('is a function', () => {
    const { get } = entityStore<TestEntity>(getID)
    assert.type(get, 'function')
})

get('accepts no params', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const { get } = entityStore<TestEntity>(getID, entities)

    const $entities = get()
    const state = svelteGet($entities)

    assert.equal(state, entities)
})

get('accepts a single ID', () => {
    const { get } = entityStore<TestEntity>(getID)
    const $entity = get('abc')

    const state = svelteGet($entity)

    assert.type($entity.subscribe, 'function')
    assert.type(state, 'undefined')
})

get('accepts an array of IDs', () => {
    const { get } = entityStore<TestEntity>(getID)
    const $entities = get(['abc', 'def'])

    const state = svelteGet($entities)

    assert.type($entities.subscribe, 'function')
    assert.ok(Array.isArray(state))
})

get('accepts a filter function', () => {
    const { get } = entityStore<TestEntity>(getID)
    const $entities = get(isCompleted)

    const state = svelteGet($entities)

    assert.type($entities.subscribe, 'function')
    assert.ok(Array.isArray(state))
})

get('returns a known entity by ID', () => {
    const entity: TestEntity = { id: 'abc', description: 'item 1', completed: false }
    const { get } = entityStore<TestEntity>(getID, [entity])

    const $entity = get(entity.id)
    const state = svelteGet($entity)

    assert.equal(state, entity)
})

get('returns all known entities for given IDs', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const { get } = entityStore<TestEntity>(getID, entities)

    const $entities = get(['abc', 'ghi'])
    const state = svelteGet($entities)

    assert.equal(state, [entities[0], entities[2]])
})

get('ignores unknown IDs', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const { get } = entityStore<TestEntity>(getID, entities)

    const $entities = get(['abc', 'jkl', 'ghi'])
    const state = svelteGet($entities)

    assert.equal(state, [entities[0], entities[2]])
})

get('returns all entities matching the filter', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const { get } = entityStore<TestEntity>(getID, entities)

    const $entities = get(isCompleted)
    const state = svelteGet($entities)

    assert.equal(state, [entities[1]])
})

get('returns an empty array if no entities match the filter', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const { get } = entityStore<TestEntity>(getID, entities)

    const $entities = get(isCompleted)
    const state = svelteGet($entities)

    assert.equal(state, [])
})

get('updates subscribers when entity is removed', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    const $entity = store.get('abc')

    const states: Array<TestEntity | undefined> = []
    const unsubscribe = $entity.subscribe((state) => states.push(state))

    store.reset()

    assert.equal(states, [entities[0], undefined])

    unsubscribe()
})

get.run()

// ---

const remove = suite('remove')

remove('is a function', () => {
    const { remove } = entityStore<TestEntity>(getID)
    assert.type(remove, 'function')
})

remove('accepts a single ID', () => {
    const entity: TestEntity = { id: 'abc', description: 'item 1', completed: false }
    const store = entityStore<TestEntity>(getID, [entity])

    store.remove('abc')

    const state = svelteGet(store)

    assert.equal(state, { byId: {}, allIds: [], activeId: undefined })
})

remove('accepts an array of IDs', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.remove(['abc'])

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            def: entities[1],
            ghi: entities[2],
        },
        allIds: ['def', 'ghi'],
        activeId: undefined,
    })
})

remove('accepts a single entity', () => {
    const entity: TestEntity = { id: 'abc', description: 'item 1', completed: false }
    const store = entityStore<TestEntity>(getID, [entity])

    store.remove(entity)

    const state = svelteGet(store)

    assert.equal(state, { byId: {}, allIds: [], activeId: undefined })
})

remove('accepts an array of entities', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.remove([entities[0]])

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            def: entities[1],
            ghi: entities[2],
        },
        allIds: ['def', 'ghi'],
        activeId: undefined,
    })
})

remove('accepts a filter function', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: true },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.remove(isCompleted)

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            def: entities[1],
            ghi: entities[2],
        },
        allIds: ['def', 'ghi'],
        activeId: undefined,
    })
})

remove('updates subscribers once', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: true },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    const states: Normalized<TestEntity>[] = []
    const unsubscribe = store.subscribe((state) => states.push(state))

    store.remove(isCompleted)

    assert.equal(states, [
        {
            byId: {
                abc: entities[0],
                def: entities[1],
                ghi: entities[2],
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        },
        {
            byId: {
                def: entities[1],
                ghi: entities[2],
            },
            allIds: ['def', 'ghi'],
            activeId: undefined,
        },
    ])

    unsubscribe()
})

remove.run()

// ---

const update = suite('update')

update('is a function', () => {
    const { update } = entityStore<TestEntity>(getID)
    assert.type(update, 'function')
})

update('accepts no parameters', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.update(toggle)

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

update('accepts a single ID', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.update(toggle, 'abc')

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: entities[1],
            ghi: entities[2],
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

update('accepts a single entity', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.update(toggle, entities[0])

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: entities[1],
            ghi: entities[2],
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

update('accepts an array of IDs', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.update(toggle, ['abc', 'ghi'])

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: entities[1],
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

update('accepts an array of entities', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: false },
        { id: 'ghi', description: 'item 3', completed: false },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.update(toggle, [entities[0], entities[2]])

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: entities[1],
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

update('accepts a filter function', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
        { id: 'ghi', description: 'item 3', completed: true },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    store.update(toggle, isCompleted)

    const state = svelteGet(store)

    assert.equal(state, {
        byId: {
            abc: entities[0],
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

update('updates subscribers once', () => {
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
        { id: 'ghi', description: 'item 3', completed: true },
    ]
    const store = entityStore<TestEntity>(getID, entities)

    const states: Normalized<TestEntity>[] = []
    const unsubscribe = store.subscribe((state) => states.push(state))

    store.update(toggle, isCompleted)

    assert.equal(states, [
        {
            byId: {
                abc: entities[0],
                def: entities[1],
                ghi: entities[2],
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        },
        {
            byId: {
                abc: entities[0],
                def: { id: 'def', description: 'item 2', completed: false },
                ghi: { id: 'ghi', description: 'item 3', completed: false },
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        },
    ])

    unsubscribe()
})

update.run()

// ---
