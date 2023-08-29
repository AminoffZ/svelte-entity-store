import { hydrateFromStore } from '../../../src'

describe('hydrate entities', () => {
    it('throws an error if no localStorage', () => {
        expect(hydrateFromStore).toThrowError('Cannot hydrate store in a non-browser environment')
    })
})
