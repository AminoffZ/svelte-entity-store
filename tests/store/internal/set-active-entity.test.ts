import { Normalized } from '../../../src/internal/normalize'
import { setActiveEntity } from '../../../src/internal/set-active-entity'

type TestEntity = {
    id: string
    description: string
    completed: boolean
    active?: boolean
}

const getId = (e: TestEntity) => e.id

test('returns the active entity', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: undefined,
    }

    const result = setActiveEntity<TestEntity>(getId)('abc')(state)

    expect(result).toEqual({
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: 'abc',
    })
})
