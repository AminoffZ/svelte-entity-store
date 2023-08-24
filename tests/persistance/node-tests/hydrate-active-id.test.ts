import { hydrateActiveId } from '../../../src/internal/hydrate-active-id'

describe('hydrate active id', () => {
    it('returns undefined activeId if no localStorage', () => {
        expect(hydrateActiveId).toThrowError('Cannot load active ID in a non-browser environment')
    })
})
