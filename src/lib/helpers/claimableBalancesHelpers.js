import moment from 'moment';

const MIN_VALUE = moment(0);
const MAX_VALUE = moment(8.64e15);

export class Period {
    constructor(start, end) {
        this.start = start ? moment(start) : MIN_VALUE;

        this.end = end ? moment(end) : MAX_VALUE;
    }

    getValuableStart() {
        return this.start.isAfter(MIN_VALUE) ? this.start : null;
    }

    getValuableEnd() {
        return this.end.isBefore(MAX_VALUE) ? this.end : null;
    }
}

export const unitePeriods = (periodList1, periodList2) => {
    /**
   * Unite two periods lists.
   * @param {Array.<Period>} periodList1
   * @param {Array.<Period>} periodList2
   * @return {Array.<Period>}
   */

    if (periodList1.length === 0 && periodList2.length === 0) {
        return [];
    }

    const joinedList = [...periodList1, ...periodList2].sort((a, b) => (a.start.isBefore(b.start) ? -1 : 0));

    const resultList = [];
    let currentPeriod = joinedList[0];
    // Go through sorted union of periods and look for intersected periods. Unite them into new one.
    for (let i = 1; i < joinedList.length; i += 1) {
        const newPeriod = joinedList[i];

        if (currentPeriod.end.isBefore(newPeriod.start)) {
            // Periods do not intersect.
            resultList.push(currentPeriod);
            currentPeriod = newPeriod;
        } else {
            // Unite periods
            currentPeriod = new Period(
                moment.min([currentPeriod.start, newPeriod.start]),
                moment.max([currentPeriod.end, newPeriod.end]),
            );
        }
    }

    resultList.push(currentPeriod);
    return resultList;
};

export const intersectPeriods = (periodList1, periodList2) => {
    /**
   * Intersect two sorted periods lists.
   * @param {Array.<Period>} periodList1
   * @param {Array.<Period>} periodList2
   * @return {Array.<Period>}
   */

    const resultList = [];
    let index1 = 0;
    let index2 = 0;
    // Go through two lists in parallel. Look for period intersection.
    while (index1 < periodList1.length && index2 < periodList2.length) {
        const period1 = periodList1[index1];
        const period2 = periodList2[index2];

        if (period1.end.isBefore(period2.start)) {
            // period1 ends before period2. Take next one.
            index1 += 1;
        } else if (period2.end.isBefore(period1.start)) {
            // period2 ends before period1. Take next one.
            index2 += 1;
        } else {
            // Intersect periods.
            resultList.push(
                new Period(
                    moment.max([period1.start, period2.start]),
                    moment.min([period1.end, period2.end]),
                ),
            );

            if (period1.end.isAfter(period2.end)) {
                index2 += 1;
            } else {
                index1 += 1;
            }
        }
    }

    return resultList;
};

export const negatePeriod = periodList => {
    /**
   * Negate sorted periods list.
   * @param {Array.<Period>} periodList
   * @return {Array.<Period>}
   */

    const resultList = [];
    // Starts at minus infinite.
    let previousEnd = MIN_VALUE;
    // Go through list. Create new period base on the end of previous and start on current.
    for (let i = 0; i < periodList.length; i += 1) {
        const period = periodList[i];

        if (!period.start.isAfter(MIN_VALUE)) {
            // Current period doesn't have start. Skip it.
            previousEnd = period.end;
        } else {
            resultList.push(new Period(previousEnd, period.start));
            previousEnd = period.end;
        }
    }

    if (previousEnd.isBefore(MAX_VALUE)) {
    // If last period has finite end then we add the remainder of time ray as last period.
        resultList.push(new Period(previousEnd, null));
    }

    return resultList;
};

export const parsePredicate = predicate => {
    /**
   * Parse predicate dictionary to sorted list of periods.
   * @param {Object} predicate
   * @return {Array.<Period>}
   */
    if (predicate.unconditional) {
        return [new Period(null, null)];
    }

    if (predicate.abs_before) {
        return [new Period(null, predicate.abs_before)];
    }

    if (predicate.or) {
        return unitePeriods(
            parsePredicate(predicate.or[0]),
            parsePredicate(predicate.or[1]),
        );
    }

    if (predicate.and) {
        return intersectPeriods(
            parsePredicate(predicate.and[0]),
            parsePredicate(predicate.and[1]),
        );
    }

    if (predicate.not) {
        return negatePeriod(parsePredicate(predicate.not));
    }

    return [];
};

export const getNextClaimTime = (predicate, now) => {
    /**
   * Look up the closest time of claim balance based on predicate.
   * @param {Object} predicate
   * @param {String} now
   * @return {Object}
   */

    const nowMoment = moment(now);

    const periodsList = parsePredicate(predicate);

    if (periodsList.length === 0) {
    // Conflict time periods.
        return {
            canClaim: false,
            isExpired: false,
            isConflict: true,
            claimStart: null,
            claimEnd: null,
            status: 'Conflict',
        };
    }

    for (let i = 0; i < periodsList.length; i += 1) {
        const period = periodsList[i];

        if (period.end.isBefore(nowMoment)) {
            // Continue
        } else if (
            nowMoment.isBetween(period.start, period.end) &&
      period.end.isSame(MAX_VALUE)
        ) {
            // If all time limit stay in the past we don't show them.
            return {
                canClaim: true,
                isExpired: false,
                isConflict: false,
                claimStart: null,
                claimEnd: null,
                status: 'Pending',
            };
        } else if (nowMoment.isBetween(period.start, period.end)) {
            return {
                canClaim: true,
                isExpired: false,
                isConflict: false,
                claimStart: period.getValuableStart(),
                claimEnd: period.getValuableEnd(),
                status: 'Pending',
            };
        } else if (nowMoment.isBefore(period.start)) {
            return {
                canClaim: false,
                isExpired: false,
                isConflict: false,
                claimStart: period.getValuableStart(),
                claimEnd: period.getValuableEnd(),
                status: 'Upcoming',
            };
        }
    }

    return {
        canClaim: false,
        isExpired: true,
        isConflict: false,
        claimStart: periodsList[periodsList.length - 1].getValuableStart(),
        claimEnd: periodsList[periodsList.length - 1].getValuableEnd(),
        status: 'Expired',
    };
};

// Returns amount of claimable balances, can be claimed right now
export const getAvailableClaimsCount = (claims, publicKey) => {
    let claimsCount = 0;

    claims.forEach(({ claimants }) => {
        const { canClaim } = getNextClaimTime(
            claimants.find(({ destination }) => destination === publicKey).predicate,
            moment().toISOString(),
        );

        if (canClaim) {
            claimsCount += 1;
        }
    });

    return claimsCount;
};
