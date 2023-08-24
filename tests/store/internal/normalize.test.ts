import { normalize } from '../../../src/internal/normalize'

type TestEntity = {
    id: string
    description: string
}

const getID = (e: TestEntity) => e.id

test('is a function', () => {
    expect(normalize).toBeInstanceOf(Function)
})

test('handles an empty array', () => {
    const state = normalize(getID)([])

    expect(state).toEqual({
        byId: {},
        allIds: [],
        activeId: undefined,
    })
})

test('handles an array of one item', () => {
    const item: TestEntity = { id: 'abc', description: 'item 1' }

    const state = normalize(getID)([item])

    expect(state).toEqual({
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

    expect(state).toEqual({
        byId: {
            abc: items[0],
            def: items[1],
        },
        allIds: ['abc', 'def'],
        activeId: undefined,
    })
})
