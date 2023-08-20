import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { normalize } from '../../src/internal/normalize'

type TestEntity = {
    id: string
    description: string
}

const getID = (e: TestEntity) => e.id

test('is a function', () => {
    assert.type(normalize, 'function')
})

test('handles an empty array', () => {
    const state = normalize(getID)([])

    assert.equal(state, {
        byId: {},
        allIds: [],
        activeId: undefined,
    })
})

test('handles an array of one item', () => {
    const item: TestEntity = { id: 'abc', description: 'item 1' }

    const state = normalize(getID)([item])

    assert.equal(state, {
        byId: {
            abc: item,
        },
        allIds: ['abc'],
        activeId: undefined,
    })
})

test('maintains item order', () => {
    const items: TestEntity[] = [
        { id: 'abc', description: 'item 1' },
        { id: 'def', description: 'item 2' },
    ]

    const state = normalize(getID)(items)

    assert.equal(state, {
        byId: {
            abc: items[0],
            def: items[1],
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})

test.run()
