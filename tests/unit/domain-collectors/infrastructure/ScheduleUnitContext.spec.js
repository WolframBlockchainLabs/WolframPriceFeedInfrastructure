import {
    HOURS_IN_A_DAY,
    MILLISECONDS_IN_AN_HOUR,
    MILLISECONDS_IN_A_MINUTE,
    MILLISECONDS_IN_A_SECOND,
    MINUTES_IN_AN_HOUR,
    SECONDS_IN_A_MINUTE,
} from '#constants/timeframes.js';
import ScheduleUnitContext from '#domain-collectors/infrastructure/ScheduleUnitContext.js';

describe('[domain-collectors]: ScheduleUnitContext Tests Suite', () => {
    test('getContext should return SECOND context for intervals less than a minute', () => {
        const intervalInMs = MILLISECONDS_IN_A_SECOND * 30;
        const expectedContext = {
            unit: SECONDS_IN_A_MINUTE,
            timeUnitDivisor: MILLISECONDS_IN_A_SECOND,
            cronString: '* * * * *',
        };
        expect(ScheduleUnitContext.getContext(intervalInMs)).toEqual(
            expectedContext,
        );
    });

    test('getContext should return MINUTE context for intervals less than an hour but greater than or equal to a minute', () => {
        const intervalInMs = MILLISECONDS_IN_A_MINUTE * 10;
        const expectedContext = {
            unit: MINUTES_IN_AN_HOUR,
            timeUnitDivisor: MILLISECONDS_IN_A_MINUTE,
            cronString: '* * * *',
        };
        expect(ScheduleUnitContext.getContext(intervalInMs)).toEqual(
            expectedContext,
        );
    });

    test('getContext should return HOUR context for intervals greater than or equal to an hour', () => {
        const intervalInMs = MILLISECONDS_IN_AN_HOUR * 5;
        const expectedContext = {
            unit: HOURS_IN_A_DAY,
            timeUnitDivisor: MILLISECONDS_IN_AN_HOUR,
            cronString: '* * *',
        };
        expect(ScheduleUnitContext.getContext(intervalInMs)).toEqual(
            expectedContext,
        );
    });

    test('getContext should return MINUTE context for intervals equal to a minute', () => {
        const intervalInMs = MILLISECONDS_IN_A_MINUTE;
        const expectedContext = {
            unit: MINUTES_IN_AN_HOUR,
            timeUnitDivisor: MILLISECONDS_IN_A_MINUTE,
            cronString: '* * * *',
        };
        expect(ScheduleUnitContext.getContext(intervalInMs)).toEqual(
            expectedContext,
        );
    });

    test('getContext should return HOUR context for intervals equal to an hour', () => {
        const intervalInMs = MILLISECONDS_IN_AN_HOUR;
        const expectedContext = {
            unit: HOURS_IN_A_DAY,
            timeUnitDivisor: MILLISECONDS_IN_AN_HOUR,
            cronString: '* * *',
        };
        expect(ScheduleUnitContext.getContext(intervalInMs)).toEqual(
            expectedContext,
        );
    });
});
