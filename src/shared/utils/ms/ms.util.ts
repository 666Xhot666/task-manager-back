const enum MillisecondsInUnit {
	ms = 1,
	s = ms * 1000,
	m = s * 60,
	h = m * 60,
	d = h * 24,
	w = d * 7,
	mo = d * 30.4375,
	y = d * 365.25,
}

type Unit =
	| 'Years'
	| 'Year'
	| 'Yrs'
	| 'Yr'
	| 'Y'
	| 'Months'
	| 'Month'
	| 'Mo'
	| 'Mth'
	| 'Weeks'
	| 'Week'
	| 'W'
	| 'Days'
	| 'Day'
	| 'D'
	| 'Hours'
	| 'Hour'
	| 'Hrs'
	| 'Hr'
	| 'H'
	| 'Minutes'
	| 'Minute'
	| 'Mins'
	| 'Min'
	| 'm'
	| 'mns'
	| 'mn'
	| 'Mns'
	| 'Mn'
	| 'Seconds'
	| 'Second'
	| 'Secs'
	| 'Sec'
	| 'S'
	| 'Milliseconds'
	| 'Millisecond'
	| 'Ms'
	| 'Msec'
	| 'Msecs'
	| 'M';

type UnitExtended = Unit | Uppercase<Unit> | Lowercase<Unit>;

const TIME_STRING_REGEX =
	/^(?<value>-?(?:\d+)?\.?\d+)\s*(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mo|mth|years?|yrs?|y)?$/i;

export type DurationStringValue =
	| `${number}`
	| `${number}${UnitExtended}`
	| `${number} ${UnitExtended}`;

function convertToMilliseconds(value: number, unit: string): number {
	switch (unit.toLowerCase() as Lowercase<Unit> | '') {
		case 'years':
		case 'year':
		case 'yrs':
		case 'yr':
		case 'y':
			return value * MillisecondsInUnit.y;
		case 'months':
		case 'month':
		case 'mth':
		case 'mo':
			return value * MillisecondsInUnit.mo;
		case 'weeks':
		case 'week':
		case 'w':
			return value * MillisecondsInUnit.w;
		case 'days':
		case 'day':
		case 'd':
			return value * MillisecondsInUnit.d;
		case 'hours':
		case 'hour':
		case 'hrs':
		case 'hr':
		case 'h':
			return value * MillisecondsInUnit.h;
		case 'minutes':
		case 'minute':
		case 'mins':
		case 'min':
		case 'mns':
		case 'mn':
		case 'm':
			return value * MillisecondsInUnit.m;
		case 'seconds':
		case 'second':
		case 'secs':
		case 'sec':
		case 's':
			return value * MillisecondsInUnit.s;
		case 'milliseconds':
		case 'millisecond':
		case 'msecs':
		case 'msec':
		case 'ms':
		case '':
			return value;
		default:
			throw new Error(`Invalid unit: ${unit}.`);
	}
}

export function toMilliseconds(input: DurationStringValue): number {
	if (typeof input !== 'string' || input.length === 0 || input.length >= 100) {
		throw new Error(
			'Value provided to toMilliseconds must be a string with a length between 1 and 99',
		);
	}

	const match = TIME_STRING_REGEX.exec(input);
	const { value, type } = match?.groups ?? {};

	if (!value) {
		return NaN;
	}
	return convertToMilliseconds(parseFloat(value), type ?? 'ms');
}
