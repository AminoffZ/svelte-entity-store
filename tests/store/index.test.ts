import { entityStore, hydrateFromStore, persistStore } from '../../src'

test('exports the entityStore constructor', () => {
    expect(entityStore).toBeInstanceOf(Function)
})

test('exports the hydrateFromStore function', () => {
    expect(hydrateFromStore).toBeInstanceOf(Function)
})

test('exports the persistStore function', () => {
    expect(persistStore).toBeInstanceOf(Function)
})
