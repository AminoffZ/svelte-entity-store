import { entityStore } from "../../../src"
import { hasLocalStorage } from "../../../src/shared"


type TestEntity = {
    id: string
    description: string
}

const getID = (e: TestEntity) => e.id

describe('persistant store tests in node', () => {
    it('returns false on localStorage in node environment', () => {
        expect(hasLocalStorage()).toBe(false)
    })

    it('returns undefined store if no localStorage', () => {
        const store = () => entityStore<TestEntity>(getID, { persist: true, storageKey: 'test' })
        expect(store()).toBeUndefined()
    })
})
