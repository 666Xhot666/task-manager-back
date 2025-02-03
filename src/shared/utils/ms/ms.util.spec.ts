import { toMilliseconds } from './ms.util';

describe('ms.util', () => {
	describe('toMilliseconds', () => {
		it('should correctly convert valid duration strings to milliseconds', () => {
			expect(toMilliseconds('10ms')).toBe(10);
			expect(toMilliseconds('10 ms')).toBe(10);
			expect(toMilliseconds('1s')).toBe(1000);
			expect(toMilliseconds('2 minutes')).toBe(120000);
			expect(toMilliseconds('3 hours')).toBe(10800000);
			expect(toMilliseconds('1 day')).toBe(86400000);
			expect(toMilliseconds('1 week')).toBe(604800000);
			expect(toMilliseconds('1 month')).toBe(2629800000);
			expect(toMilliseconds('1 year')).toBe(31557600000);
		});

		it('should handle different capitalizations of units', () => {
			expect(toMilliseconds('10Seconds')).toBe(10000);
			expect(toMilliseconds('1Hour')).toBe(3600000);
			expect(toMilliseconds('2DAYS')).toBe(172800000);
		});

		it('should correctly handle negative values', () => {
			expect(toMilliseconds('-10ms')).toBe(-10);
			expect(toMilliseconds('-1 s')).toBe(-1000);
			expect(toMilliseconds('-3 hours')).toBe(-10800000);
		});

		it('should throw an error for strings with length out of bounds', () => {
			//@ts-expect-error test length out of bounds
			expect(() => toMilliseconds('a'.repeat(100))).toThrowError(
				'Value provided to toMilliseconds must be a string with a length between 1 and 99',
			);
			//@ts-expect-error test length out of bounds
			expect(() => toMilliseconds('')).toThrowError(
				'Value provided to toMilliseconds must be a string with a length between 1 and 99',
			);
		});

		it('should return NaN for invalid unit type', () => {
			//@ts-expect-error invalid unit type
			expect(toMilliseconds('100 unicorns')).toBeNaN();
			//@ts-expect-error invalid unit type
			expect(toMilliseconds('invalid')).toBeNaN();
			//@ts-expect-error invalid unit type
			expect(toMilliseconds('100invalidUnit')).toBeNaN();
			//@ts-expect-error invalid unit type
			expect(toMilliseconds('1000miles')).toBeNaN();
		});
	});
});
