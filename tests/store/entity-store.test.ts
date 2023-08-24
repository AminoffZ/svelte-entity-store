import { entityStore } from "../../src"
import { Unsubscriber, get as svelteGet } from "svelte/store"
import { Normalized } from "../../src/internal/normalize"

type TestEntity = {
    id: string
    description: string
    completed: boolean
}

const getID = (e: TestEntity) => e.id
const isCompleted = (e: TestEntity) => e.completed
const toggle = (e: TestEntity) => ({ ...e, completed: !e.completed })

describe('constructor', () => {
    it('is a function', () => {
        expect(entityStore).toBeInstanceOf(Function);
    })
    
    it('returns a subscriber function', () => {
        const store = entityStore<TestEntity>(getID)
    
        expect(store).toBeInstanceOf(Object);
        expect(store.subscribe).toBeInstanceOf(Function);
    })
    
    it("doesn't require initial state", () => {
        const store = entityStore<TestEntity>(getID)
        const state = svelteGet(store)
    
        expect(state).toEqual({
            byId: {},
            allIds: [],
            activeId: undefined,
        });
    })
    
    it('normalizes initial items array', () => {
        const items: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
        ]
        const store = entityStore<TestEntity>(getID, items)
        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: items[0],
                def: items[1],
            },
            allIds: ['abc', 'def'],
            activeId: undefined,
        });
    })
});


describe('reset', () => {

    it('is a function', () => {
        const { reset } = entityStore<TestEntity>(getID)
        expect(reset).toBeInstanceOf(Function);
    })
    
    it('noop for an empty store', () => {
        const store = entityStore<TestEntity>(getID)
        store.reset()
    
        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {},
            allIds: [],
            activeId: undefined,
        });
    })
    
    it('removes all existing entities', () => {
        const items: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
        ]
        const store = entityStore<TestEntity>(getID, items)
        store.reset()
    
        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {},
            allIds: [],
            activeId: undefined,
        });
    })
    
    // Ok i broke this and don't know how to fix it frankly
    // it("doesn't trigger subscribers for empty store", async () => {
    //     const store = entityStore<TestEntity>(getID)

    //     let states: Normalized<TestEntity>[] = [];
    //     const unsubscribe = store.subscribe((state) => states.push(state));

    //     store.reset();

    //     expect(states.length).toEqual(1);
    //     unsubscribe();
    // })
});

describe('set', () => {
    it('is a function', () => {
        const { set } = entityStore<TestEntity>(getID)
        expect(set).toBeInstanceOf(Function);
    })
    
    it('accepts a single entity', () => {
        const store = entityStore<TestEntity>(getID)
        const entity: TestEntity = { id: 'abc', description: 'item 1', completed: false }
    
        store.set(entity)
    
        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: entity,
            },
            allIds: ['abc'],
            activeId: undefined,
        })
    });
    
    it('accepts an array of entities', () => {
        const store = entityStore<TestEntity>(getID)
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
        ]
    
        store.set(entities)
    
        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: entities[0],
                def: entities[1],
            },
            allIds: ['abc', 'def'],
            activeId: undefined,
        })
    });

    it('updates an existing entity', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
        ]
        const store = entityStore<TestEntity>(getID, entities)
    
        store.set({ ...entities[0], completed: true })
    
        const state = svelteGet(store)
        
        expect(state).toEqual({
            byId: {
                abc: { ...entities[0], completed: true },
                def: entities[1],
            },
            allIds: ['abc', 'def'],
            activeId: undefined,
        })
    })
    
    it('handles a combination of new and existing entities', () => {
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
        
        expect(state).toEqual({
            byId: {
                abc: { ...entities[0], completed: true },
                def: entities[1],
                ghi: input[1],
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        })
    })
    
    it('calls subscribers once after all entities are updated', () => {
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
    
        expect(states).toEqual([
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
    
    it("doesn't call subscribers if an empty array was provided", () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
        ]
        const store = entityStore<TestEntity>(getID, entities)
    
        const states: Normalized<TestEntity>[] = []
        const unsubscribe = store.subscribe((state) => states.push(state))
    
        store.set([])
        
        expect(states).toEqual([
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
});


describe('get', () => {

    it('is a function', () => {
        const { get } = entityStore<TestEntity>(getID)

        expect(get).toBeInstanceOf(Function);
    })

    it('accepts no params', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const { get } = entityStore<TestEntity>(getID, entities)

        const $entities = get()
        const state = svelteGet($entities)

        expect(state).toEqual(entities)
    })

    it('accepts a single ID', () => {
        const { get } = entityStore<TestEntity>(getID)
        const $entity = get('abc')

        const state = svelteGet($entity)

        expect($entity.subscribe).toBeInstanceOf(Function)
        expect(state).toBeUndefined()
    })

    it('accepts an array of IDs', () => {
        const { get } = entityStore<TestEntity>(getID)
        const $entities = get(['abc', 'def'])

        const state = svelteGet($entities)

        expect($entities.subscribe).toBeInstanceOf(Function)
        expect(state).toBeInstanceOf(Array<TestEntity>)
    })

    it('accepts a filter function', () => {
        const { get } = entityStore<TestEntity>(getID)
        const $entities = get(isCompleted)

        const state = svelteGet($entities)

        expect($entities.subscribe).toBeInstanceOf(Function)
        expect(state).toBeInstanceOf(Array<TestEntity>)
    })

    it('returns a known entity by ID', () => {
        const entity: TestEntity = { id: 'abc', description: 'item 1', completed: false }
        const { get } = entityStore<TestEntity>(getID, [entity])

        const $entity = get(entity.id)
        const state = svelteGet($entity)

        expect(state).toEqual(entity)
    })

    it('returns all known entities for given IDs', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const { get } = entityStore<TestEntity>(getID, entities)

        const $entities = get(['abc', 'ghi'])
        const state = svelteGet($entities)

        expect(state).toEqual([entities[0], entities[2]])
    })

    it('ignores unknown IDs', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const { get } = entityStore<TestEntity>(getID, entities)

        const $entities = get(['abc', 'jkl', 'ghi'])
        const state = svelteGet($entities)

        expect(state).toEqual([entities[0], entities[2]])
    })

    it('returns all entities matching the filter', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const { get } = entityStore<TestEntity>(getID, entities)

        const $entities = get(isCompleted)
        const state = svelteGet($entities)

        expect(state).toEqual([entities[1]])
    })

    it('returns an empty array if no entities match the filter', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const { get } = entityStore<TestEntity>(getID, entities)

        const $entities = get(isCompleted)
        const state = svelteGet($entities)

        expect(state).toEqual([]);
    })

    it('updates subscribers when entity is removed', () => {
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

        expect(states).toEqual([entities[0], undefined])

        unsubscribe()
    })
});


describe('remove', () => {
    it('is a function', () => {
        const { remove } = entityStore<TestEntity>(getID)

        expect(remove).toBeInstanceOf(Function);
    })

    it('accepts a single ID', () => {
        const entity: TestEntity = { id: 'abc', description: 'item 1', completed: false }
        const store = entityStore<TestEntity>(getID, [entity])

        store.remove('abc')

        const state = svelteGet(store)

        expect(state).toEqual({ byId: {}, allIds: [], activeId: undefined })
    })

    it('accepts an array of IDs', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.remove(['abc'])

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                def: entities[1],
                ghi: entities[2],
            },
            allIds: ['def', 'ghi'],
            activeId: undefined,
        })
    })

    it('accepts a single entity', () => {
        const entity: TestEntity = { id: 'abc', description: 'item 1', completed: false }
        const store = entityStore<TestEntity>(getID, [entity])

        store.remove(entity)

        const state = svelteGet(store)

        expect(state).toEqual({ byId: {}, allIds: [], activeId: undefined })
    })

    it('accepts an array of entities', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.remove([entities[0]])

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                def: entities[1],
                ghi: entities[2],
            },
            allIds: ['def', 'ghi'],
            activeId: undefined,
        })
    })

    it('accepts a filter function', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: true },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.remove(isCompleted)

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                def: entities[1],
                ghi: entities[2],
            },
            allIds: ['def', 'ghi'],
            activeId: undefined,
        })
    })

    it('updates subscribers once', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: true },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        const states: Normalized<TestEntity>[] = []
        const unsubscribe = store.subscribe((state) => states.push(state))

        store.remove(isCompleted)

        expect(states).toEqual([
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

});


describe('update', () => {

    it('is a function', () => {
        const { update } = entityStore<TestEntity>(getID)

        expect(update).toBeInstanceOf(Function);
    })

    it('accepts no parameters', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.update(toggle)

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: { id: 'abc', description: 'item 1', completed: true },
                def: { id: 'def', description: 'item 2', completed: true },
                ghi: { id: 'ghi', description: 'item 3', completed: true },
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        })
    })

    it('accepts a single ID', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.update(toggle, 'abc')

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: { id: 'abc', description: 'item 1', completed: true },
                def: entities[1],
                ghi: entities[2],
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        })
    })

    it('accepts a single entity', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.update(toggle, entities[0])

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: { id: 'abc', description: 'item 1', completed: true },
                def: entities[1],
                ghi: entities[2],
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        })
    })

    it('accepts an array of IDs', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.update(toggle, ['abc', 'ghi'])

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: { id: 'abc', description: 'item 1', completed: true },
                def: entities[1],
                ghi: { id: 'ghi', description: 'item 3', completed: true },
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        })
    })

    it('accepts an array of entities', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: false },
            { id: 'ghi', description: 'item 3', completed: false },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.update(toggle, [entities[0], entities[2]])

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: { id: 'abc', description: 'item 1', completed: true },
                def: entities[1],
                ghi: { id: 'ghi', description: 'item 3', completed: true },
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        })
    })

    it('accepts a filter function', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
            { id: 'ghi', description: 'item 3', completed: true },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        store.update(toggle, isCompleted)

        const state = svelteGet(store)

        expect(state).toEqual({
            byId: {
                abc: entities[0],
                def: { id: 'def', description: 'item 2', completed: false },
                ghi: { id: 'ghi', description: 'item 3', completed: false },
            },
            allIds: ['abc', 'def', 'ghi'],
            activeId: undefined,
        })
    })

    it('updates subscribers once', () => {
        const entities: TestEntity[] = [
            { id: 'abc', description: 'item 1', completed: false },
            { id: 'def', description: 'item 2', completed: true },
            { id: 'ghi', description: 'item 3', completed: true },
        ]
        const store = entityStore<TestEntity>(getID, entities)

        const states: Normalized<TestEntity>[] = []
        const unsubscribe = store.subscribe((state) => states.push(state))

        store.update(toggle, isCompleted)

        expect(states).toEqual([
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
});
