import { hydrateEntities } from '../../../src/internal/hydrate-entities'
import { Normalized } from '../../../src/internal/normalize'

type TestEntity = {
    id: string
    description: string
    completed: boolean
}

const entities: TestEntity[] = [
    { id: 'abc', description: 'item 1', completed: false },
    { id: 'def', description: 'item 2', completed: true },
    { id: 'ghi', description: 'item 3', completed: false },
]

const normalized: Normalized<TestEntity> = {
    byId: {
        abc: { id: 'abc', description: 'item 1', completed: false },
        def: { id: 'def', description: 'item 2', completed: true },
        ghi: { id: 'ghi', description: 'item 3', completed: false },
        jkl: { id: 'jkl', description: 'item 4', completed: false },
    },
    allIds: ['abc', 'def', 'ghi'],
    activeId: undefined,
}

beforeEach(() => {
    localStorage.clear()
})

describe('hydrate entities', () => {
    it("hydrates entities with fallback local storage if they don't exist in localStorage", () => {
        const hydratedEntities = hydrateEntities('test', entities)
        expect(hydratedEntities).toEqual(entities)
    })
    const savedEntities = [...entities, { id: 'jkl', description: 'item 4', completed: false }]

    it('hydrates entities with localStorage if they exist in localStorage', () => {
        window.localStorage.setItem('test', JSON.stringify(normalized))
        const hydratedEntities = hydrateEntities('test', entities)
        expect(hydratedEntities).toEqual(savedEntities)
    })
})
