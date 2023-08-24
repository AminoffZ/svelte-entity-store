import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { setEntities } from '../../../src/internal/set-entities'

type TestEntity = {
    id: string
    description: string
}

const getId = (e) => e.id

const setEntitiesT = setEntities(getId)

test('is a function', () => {
    assert.type(setEntities, 'function')
})

test('accepts a single entity', () => {
    const initial = { byId: {}, allIds: [], activeId: undefined }
    const entity = { id: 'abc', description: 'item 1' }

    const result = setEntitiesT(entity)(initial)

    assert.equal(result, { byId: { abc: entity }, allIds: ['abc'], activeId: undefined })
})

test('accepts an array of entities', () => {
    const initial = { byId: {}, allIds: [], activeId: undefined }
    const entities: TestEntity[] = [
        { id: 'abc', description: 'item 1' },
        { id: 'def', description: 'item 2' },
    ]

    const result = setEntitiesT(entities)(initial)

    assert.equal(result, {
        byId: {
            abc: entities[0],
            def: entities[1],
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})

test('replaces existing entities', () => {
    const initial = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    }
    const entity: TestEntity = { id: 'abc', description: 'item 10' }

    const result = setEntitiesT(entity)(initial)

    assert.equal(result, {
        byId: {
            abc: entity,
            def: initial.byId.def,
        },
        allIds: initial.allIds,
        activeId: undefined,
    })
})

test('handles a mix of existing and new entities', () => {
    const initial = {
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

    assert.equal(result, {
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
    const initial = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    }

    const result = setEntitiesT([])(initial)

    assert.equal(initial, result)
})

test.run()
