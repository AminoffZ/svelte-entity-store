import { entityStore } from '../../src'

test('exports the entityStore constructor', () => {
    expect(entityStore).toBeInstanceOf(Function)
})
