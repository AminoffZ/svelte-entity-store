import { removeEntities } from '../../../src/internal/remove-entities'
import { Normalized } from '../../../src/internal/normalize'

type TestEntity = {
    id: string
    description: string
    completed: boolean
}

const getId = (e: TestEntity) => e.id
const isCompleted = (e: TestEntity) => e.completed

const removeEntitiesT = removeEntities(getId)

test('is a function', () => {
    expect(removeEntities).toBeInstanceOf(Function)
})

test('accepts a single ID', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
    }
    const result = removeEntitiesT('abc')(state)

    expect(result).toEqual({
        byId: {},
        allIds: [],
        activeId: undefined,
    })
})

test('accepts an array of IDs', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    }
    const result = removeEntitiesT(['abc', 'ghi'])(state)

    expect(result).toEqual({
        byId: {
            def: state.byId.def,
        },
        allIds: ['def'],
        activeId: undefined,
    })
})

test('accepts an entity object', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }
    const result = removeEntitiesT(state.byId.abc)(state)

    expect(result).toEqual({
        byId: {
            def: state.byId.def,
            ghi: state.byId.ghi,
        },
        allIds: ['def', 'ghi'],
        activeId: undefined,
    })
})

test('accepts an array of entity objects', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    }
    const result = removeEntitiesT([state.byId.abc, state.byId.ghi])(state)

    expect(result).toEqual({
        byId: {
            def: state.byId.def,
        },
        allIds: ['def'],
        activeId: undefined,
    })
})

test('accepts a filter function', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    }
    const result = removeEntitiesT(isCompleted)(state)

    expect(result).toEqual({
        byId: {
            def: state.byId.def,
        },
        allIds: ['def'],
        activeId: undefined,
    })
})

test('ignores unknown ID', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
        activeId: undefined,
    }
    const result = removeEntitiesT('def')(state)

    expect(result).toEqual(state)
})

test('ignores unknown IDs in an array', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    }
    const result = removeEntitiesT(['jkl', 'ghi'])(state)

    expect(result).toEqual({
        byId: {
            abc: state.byId.abc,
            def: state.byId.def,
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})

test('ignores an unknown entity', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
        activeId: undefined,
    }
    const result = removeEntitiesT({
        id: 'def',
        description: 'item 2',
        completed: false,
    })(state)

    expect(result).toEqual(state)
})

test('ignores unknown entities in an array', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }
    const result = removeEntitiesT([
        {
            id: 'jkl',
            description: 'item 4',
            completed: false,
        },
        state.byId.ghi,
    ])(state)

    expect(result).toEqual({
        byId: {
            abc: state.byId.abc,
            def: state.byId.def,
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})
