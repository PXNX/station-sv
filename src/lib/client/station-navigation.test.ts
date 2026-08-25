import { describe, expect, it } from 'vitest';
import { shouldAnimateStationNavigation } from './station-navigation';

const plainClick = {
	defaultPrevented: false,
	button: 0,
	metaKey: false,
	ctrlKey: false,
	shiftKey: false,
	altKey: false
};

describe('shouldAnimateStationNavigation', () => {
	it('animates a plain primary click', () => {
		expect(shouldAnimateStationNavigation(plainClick)).toBe(true);
	});

	it('preserves modified or browser-managed link actions', () => {
		expect(shouldAnimateStationNavigation({ ...plainClick, ctrlKey: true })).toBe(false);
		expect(shouldAnimateStationNavigation({ ...plainClick, button: 1 })).toBe(false);
		expect(shouldAnimateStationNavigation({ ...plainClick, defaultPrevented: true })).toBe(false);
	});
});
