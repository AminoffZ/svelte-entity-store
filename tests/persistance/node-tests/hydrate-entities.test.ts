import { hydrateEntities } from '../../../src/internal/hydrate-entities'

describe('hydrate entities', () => {
    it('throws an error if no localStorage', () => {
        expect(hydrateEntities).toThrowError('Cannot hydrate store in a non-browser environment')
    })
})
