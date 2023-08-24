import { hydrateActiveId } from "../../../src/internal/hydrate-active-id";

const entities = [
    { id: 'abc', description: 'item 1', completed: false },
    { id: 'def', description: 'item 2', completed: false },
    { id: 'ghi', description: 'item 3', completed: false },
]

const normalized = {
    byId: {
        abc: entities[0],
        def: entities[1],
        ghi: entities[2],
    },
    allIds: ['abc', 'def', 'ghi'],
    activeId: 'abc',
}

describe('hydrate active id', () => {
    it('hydrates to undefined if not stored value', () => {
        const hydratedActiveId = hydrateActiveId('test');
        expect(hydratedActiveId).toEqual(undefined);
    });
    
    it ('hydrates to stored value', () => {
        window.localStorage.setItem('test', JSON.stringify(normalized));
        const hydratedActiveId = hydrateActiveId('test');
        expect(hydratedActiveId).toEqual('abc');
    });
});
