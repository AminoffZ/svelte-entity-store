import { Normalized } from '../../../src/internal/normalize'
import { setEntities } from '../../../src/internal/set-entities'

type TestEntity = {
    id: string
    description: string
}

const getId = (e: TestEntity) => e.id

const setEntitiesT = setEntities(getId)

test('is a function', () => {
    expect(setEntities).toBeInstanceOf(Function)
})

test('accepts a single entity', () => {
    const initial: Normalized<TestEntity> = { byId: {}, allIds: [], activeId: undefined }
    const entity: TestEntity = { id: 'abc', description: 'item 1' }

    const result = setEntitiesT(entity)(initial)

    expect(result).toEqual({
        byId: {
            abc: entity,
        },
        allIds: ['abc'],
        activeId: undefined,
    })
})

test('accepts an array of entities', () => {
    const initial: Normalized<TestEntity> = { byId: {}, allIds: [], activeId: undefined }
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1' },
        { id: 'def', description: 'item 2' },
    ]

    const result = setEntitiesT(entities)(initial)

    expect(result).toEqual({
        byId: {
            abc: entities[0],
            def: entities[1],
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})

test('replaces existing entities', () => {
    const initial: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    }
    const entity: TestEntity = { id: 'abc', description: 'item 10' }

    const result = setEntitiesT(entity)(initial)

    expect(result).toEqual({
        byId: {
            abc: entity,
            def: initial.byId.def,
        },
        allIds: initial.allIds,
        activeId: undefined,
    })
})

test('handles a mix of existing and new entities', () => {
    const initial: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
        },
        allIds: ['abc', 'def'],
    }
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 10' },
        { id: 'ghi', description: 'item 3' },
    ]

    const result = setEntitiesT(entities)(initial)

    expect(result).toEqual({
        byId: {
            abc: entities[0],
            def: initial.byId.def,
            ghi: entities[1],
        },
        allIds: initial.allIds.concat(entities[1].id),
        activeId: undefined,
    })
})

test('noop for an empty array', () => {
    const initial: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    }

    const result = setEntitiesT([])(initial)

    expect(result).toEqual(initial)
})
