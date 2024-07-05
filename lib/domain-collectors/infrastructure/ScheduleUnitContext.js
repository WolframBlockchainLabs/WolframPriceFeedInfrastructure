import {
    HOURS_IN_A_DAY,
    MILLISECONDS_IN_AN_HOUR,
    MILLISECONDS_IN_A_MINUTE,
    MILLISECONDS_IN_A_SECOND,
    MINUTES_IN_AN_HOUR,
    SECONDS_IN_A_MINUTE,
} from '#constants/timeframes.js';

class ScheduleUnitContext {
    static TYPES = {
        SECOND: {
            unit: SECONDS_IN_A_MINUTE,
            timeUnitDivisor: MILLISECONDS_IN_A_SECOND,
            cronString: '* * * * *',
        },
        MINUTE: {
            unit: MINUTES_IN_AN_HOUR,
            timeUnitDivisor: MILLISECONDS_IN_A_MINUTE,
            cronString: '* * * *',
        },
        HOUR: {
            unit: HOURS_IN_A_DAY,
            timeUnitDivisor: MILLISECONDS_IN_AN_HOUR,
            cronString: '* * *',
        },
    };

    static getContext(intervalInMs) {
        if (intervalInMs < MILLISECONDS_IN_A_MINUTE) {
            return this.TYPES.SECOND;
        }

        if (intervalInMs < MILLISECONDS_IN_AN_HOUR) {
            return this.TYPES.MINUTE;
        }

        return this.TYPES.HOUR;
    }
}

export default ScheduleUnitContext;
