import { describe, expect, it } from 'vitest';
import { getTransportStyle } from './transports';

describe('getTransportStyle', () => {
	it('maps known enum values to readable names', () => {
		expect(getTransportStyle('REGIONAL_TRAIN').label).toBe('Regional train');
		expect(getTransportStyle('CITY_TRAIN').label).toBe('City train · S-Bahn');
		expect(getTransportStyle('HIGH_SPEED_TRAIN').short).toBe('ICE');
	});

	it('accepts lowercase values', () => {
		expect(getTransportStyle('bus').label).toBe('Bus');
	});

	it('formats unknown values readably', () => {
		expect(getTransportStyle('NIGHT_BUS').label).toBe('Night Bus');
	});
});
