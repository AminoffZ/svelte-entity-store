import { hydrateFromStore, persistStore } from '../../../src'
import { Writable, writable } from 'svelte/store'

type AudioSettings = {
    master: number
    music: number
    sfx: number
}

const initialValue = {
    master: 100,
    music: 100,
    sfx: 100,
}

let audioStore: Writable<AudioSettings>

beforeEach(() => {
    window.localStorage.clear()
})

describe('works without entity pattern', () => {
    it('hydrates with init when empty', () => {
        const hydrated = hydrateFromStore('audio', initialValue)
        expect(hydrated).toEqual(initialValue)
    })
    it('hydrates with saved when present', () => {
        const saved = {
            master: 50,
            music: 50,
            sfx: 50,
        }
        window.localStorage.setItem('audio', JSON.stringify(saved))
        const hydrated = hydrateFromStore('audio', initialValue)
        expect(hydrated).toEqual(saved)
    })
    it('updates localStorage when store changes', () => {
        const hydrated = hydrateFromStore('audio', initialValue)
        audioStore = writable(hydrated)
        persistStore(audioStore, 'audio')
        audioStore.update((audio) => {
            return { ...audio, master: 20, music: 20, sfx: 20 }
        })
        expect(JSON.parse(window.localStorage.getItem('audio') || '{}')).toEqual({
            master: 20,
            music: 20,
            sfx: 20,
        })
    })
})
