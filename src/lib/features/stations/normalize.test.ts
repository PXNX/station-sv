import { describe, expect, it } from 'vitest';
import { displayCity, normalizeCategory, normalizeCountry } from './normalize';

describe('normalizeCategory', () => {
	it('keeps valid 1–7 categories', () => {
		for (const value of [1, 2, 3, 4, 5, 6, 7]) {
			expect(normalizeCategory(value)).toBe(value);
		}
	});

	it('accepts numeric strings from imports', () => {
		expect(normalizeCategory('3')).toBe(3);
	});

	it('falls back to the lowest tier for missing or invalid values', () => {
		expect(normalizeCategory(null)).toBe(7);
		expect(normalizeCategory(undefined)).toBe(7);
		expect(normalizeCategory(0)).toBe(7);
		expect(normalizeCategory(99)).toBe(7);
		expect(normalizeCategory('n/a')).toBe(7);
	});
});

describe('displayCity', () => {
	it('drops a city that repeats the station name', () => {
		expect(displayCity('Abensberg', 'Abensberg')).toBeNull();
		expect(displayCity('München Hbf', 'münchen hbf')).toBeNull();
	});

	it('keeps a genuinely different city', () => {
		expect(displayCity('München Hbf', 'München')).toBe('München');
	});

	it('handles missing values', () => {
		expect(displayCity('Station', null)).toBeNull();
		expect(displayCity('Station', '   ')).toBeNull();
	});
});

describe('normalizeCountry', () => {
	it('uppercases and pads country codes', () => {
		expect(normalizeCountry('de')).toBe('DE');
		expect(normalizeCountry(' DE ')).toBe('DE');
	});

	it('defaults to DE', () => {
		expect(normalizeCountry(null)).toBe('DE');
		expect(normalizeCountry('')).toBe('DE');
	});
});
