import { updateEntities } from '../../../src/internal/update-entities'
import type { Normalized } from '../../../src/internal/normalize'

type TestEntity = {
    id: string
    description: string
    completed: boolean
}

const getId = (e: TestEntity) => e.id
const isCompleted = (e: TestEntity) => e.completed
const toggle = (e: TestEntity) => ({ ...e, completed: !e.completed })

const updateEntitiesT = updateEntities(getId)

test('is a function', () => {
    expect(updateEntities).toBeInstanceOf(Function)
})

test('accepts no parameters', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = updateEntitiesT(toggle)()(state)

    expect(result).toEqual({
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

test('accepts a single ID', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = updateEntitiesT(toggle)('abc')(state)

    expect(result).toEqual({
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

test('accepts a single entity', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = updateEntitiesT(toggle)(state.byId.abc)(state)

    expect(result).toEqual({
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

test('accepts an array of IDs', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = updateEntitiesT(toggle)(['abc', 'ghi'])(state)

    expect(result).toEqual({
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

test('accepts an array of entities', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = updateEntitiesT(toggle)([state.byId.abc, state.byId.ghi])(state)

    expect(result).toEqual({
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    })
})

test('accepts a filter function', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: 'abc',
    }

    const result = updateEntitiesT(toggle)(isCompleted)(state)

    expect(result).toEqual({
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: 'abc',
    })
})
