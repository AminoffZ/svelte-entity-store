import { hasLocalStorage } from '../../../src/shared';

describe('persistant store tests in browser', () => {
    it('returns false on localStorage in node environment', () => {
        expect(hasLocalStorage()).toBe(true);
    });

    it('saves data to local storage', () => {
        const data = { name: 'John' };
        const key = 'user';
        window.localStorage.setItem(key, JSON.stringify(data));
        expect(localStorage.getItem(key)).toBe(JSON.stringify(data));
    });
});
