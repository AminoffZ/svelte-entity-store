import { getEntities } from '../../../src/internal/get-entities'
import { Normalized } from '../../../src/internal/normalize'

type TestEntity = {
    id: string
    description: string
    completed: boolean
}

const isCompleted = (e: TestEntity) => e.completed

test('is a function', () => {
    expect(getEntities).toBeInstanceOf(Function)
})

test('returns all entities if given no parameters', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = getEntities<TestEntity>()(state)

    expect(result).toEqual([state.byId.abc, state.byId.def, state.byId.ghi])
})

test('accepts a single ID', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
        activeId: undefined,
    }

    const result = getEntities<TestEntity>('abc')(state)

    expect(result).toEqual(state.byId.abc)
})

test('returns undefined for an unknown ID', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
    }

    const result = getEntities<TestEntity>('def')(state)

    expect(result).toBeUndefined()
})

test('accepts an array of IDs', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = getEntities<TestEntity>(['abc', 'ghi'])(state)

    expect(result).toEqual([state.byId.abc, state.byId.ghi])
})

test('ignores unknown IDs from an array', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = getEntities<TestEntity>(['abc', 'jkl'])(state)

    expect(result).toEqual([state.byId.abc])
})

test('accepts a filter function', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = getEntities<TestEntity>(isCompleted)(state)
    expect(result).toEqual([state.byId.def, state.byId.ghi])
})

test('returns an empty array if no entities match filter', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = getEntities<TestEntity>(isCompleted)(state)

    expect(result).toEqual([])
})
