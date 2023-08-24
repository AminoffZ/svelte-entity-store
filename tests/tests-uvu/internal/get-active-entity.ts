import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Normalized } from '../../../src/internal/normalize'
import { getActiveEntity } from '../../../src/internal/get-active-entity'

type TestEntity = {
    id: string
    description: string
    completed: boolean
    active?: boolean
}

test('returns the active entity', () => {
    const state: Normalized<TestEntity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
        activeId: 'ghi',
    }

    const result = getActiveEntity<TestEntity>()(state)

    assert.equal(result, state.byId.ghi)
})

test.run()
