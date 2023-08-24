import { entityStore } from "../../../src"
import { EntityStore } from "../../../src/entity-store"
import { Normalized } from "../../../src/internal/normalize"

type TestEntity = {
    id: string
    description: string
}

const getID = (e: TestEntity) => e.id

const entities = [
    { id: 'abc', description: 'item 1' },
    { id: 'def', description: 'item 2' },
    { id: 'ghi', description: 'item 3' },
]

const normalized: Normalized<TestEntity> = {
    byId: {
        abc: entities[0],
        def: entities[1],
        ghi: entities[2],
    },
    allIds: ['abc', 'def', 'ghi'],
    activeId: undefined,
}

let store: EntityStore<TestEntity>;
beforeEach(() => {
    window.localStorage.clear();
    store = entityStore<TestEntity>(getID, entities, { persist: true, storageKey: 'test' });
});


describe('persist store', () => {
    it('creates a persistant store', () => {
        const savedStoreJSON = window.localStorage.getItem('test');
        const savedStore = JSON.parse(savedStoreJSON || '{}');
        expect(savedStore).toEqual(normalized);
    });
    it('updates the store when an entity is added', () => {
        const newEntity = { id: 'jkl', description: 'item 4' };
        store.set(newEntity);
        const savedStoreJSON = window.localStorage.getItem('test');
        const savedStore = JSON.parse(savedStoreJSON || '{}');
        const newNormalized: Normalized<TestEntity> = {
            byId: {
                ...normalized.byId,
                jkl: newEntity,
            },
            allIds: [...normalized.allIds, 'jkl'],
            activeId: undefined,
        }
        expect(savedStore).toEqual(newNormalized);
    });
    it('updates the store when an entity is removed', () => {
        store.remove('jkl');
        const savedStoreJSON = window.localStorage.getItem('test');
        const savedStore = JSON.parse(savedStoreJSON || '{}');
        expect(savedStore).toEqual(normalized);
    }
    );
    it('updates the store when an entity is updated', () => {
        const updatedEntity = { id: 'abc', description: 'item 1 updated' };
        store.set(updatedEntity);
        const savedStoreJSON = window.localStorage.getItem('test');
        const savedStore = JSON.parse(savedStoreJSON || '{}');
        const newNormalized: Normalized<TestEntity> = {
            byId: {
                ...normalized.byId,
                abc: updatedEntity,
            },
            allIds: normalized.allIds,
            activeId: undefined,
        }
        expect(savedStore).toEqual(newNormalized);
    });
    it('updates the store when activeId is set', () => {
        store.setActive('abc');
        const savedStoreJSON = window.localStorage.getItem('test');
        const savedStore = JSON.parse(savedStoreJSON || '{}');
        const newNormalized: Normalized<TestEntity> = {
            byId: normalized.byId,
            allIds: normalized.allIds,
            activeId: 'abc',
        }
        expect(savedStore).toEqual(newNormalized);
    });
});
