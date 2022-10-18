import Debounce from 'awesome-debounce-promise';
import Event from '../../helpers/Event';

export const PAYMENTS_EVENTS = {
    START_REQUEST: 'start request',
    GET_PAYMENTS_REQUEST: 'get payments request',
    NEXT_PAYMENTS_REQUEST: 'next payment request',
    UPDATE_PAYMENTS_REQUEST: 'update payments request',
};

const UPDATE_PAYMENTS_DEPS = 10;


export default class Payments {
    constructor(driver) {
        this.driver = driver;

        this.debouncedUpdateLatestPayments = Debounce(this.updateLatestPayments.bind(this), 700);

        this.event = new Event();
        this.isFullLoaded = false;

        this.loading = false;

        this.paymentsHistory = [];
        this.nextPaymentsHistoryRequest = null;
    }

    getPaymentsHistory() {
        this.loading = true;
        this.event.trigger({ type: PAYMENTS_EVENTS.START_REQUEST });

        this.getPayments(200)
            .then(result => {
                this.paymentsHistory = result.records;
                this.nextPaymentsHistoryRequest = result.next;
                this.loading = false;
                this.event.trigger({ type: PAYMENTS_EVENTS.GET_PAYMENTS_REQUEST });
            });
    }

    loadMorePaymentsHistory() {
        if (!this.nextPaymentsHistoryRequest || this.isFullLoaded || this.loading) {
            return;
        }

        this.loading = true;
        this.event.trigger({ type: PAYMENTS_EVENTS.START_REQUEST });

        this.nextPaymentsHistoryRequest().then(result => {
            this.paymentsHistory = [...this.paymentsHistory, ...result.records];
            this.nextPaymentsHistoryRequest = result.next;
            this.isFullLoaded = result.records.length === 0;
            this.loading = false;

            this.event.trigger({
                type: PAYMENTS_EVENTS.NEXT_PAYMENTS_REQUEST,
                newItems: result.records,
            });
        });
    }

    updateLatestPayments() {
        if (!this.paymentsHistory.length) {
            return null;
        }

        return this.getPayments(UPDATE_PAYMENTS_DEPS)
            .then(result => {
                const { records } = result;

                const firstHistoryId = this.paymentsHistory[0].id;

                const recordsFirstCommonIndex = records.findIndex(record => record.id === firstHistoryId);

                this.paymentsHistory = [...records.slice(0, recordsFirstCommonIndex), ...this.paymentsHistory];

                this.event.trigger({
                    type: PAYMENTS_EVENTS.UPDATE_HISTORY_REQUEST,
                });
            });
    }


    getPayments(opLimit) {
        return this.driver.Server.payments()
            .forAccount(this.driver.session.account.account_id)
            .limit(opLimit)
            .order('desc')
            .call();
    }

    resetPayments() {
        this.isFullLoaded = false;
        this.loading = false;
        this.paymentsHistory = [];
        this.nextPaymentsHistoryRequest = null;
    }
}
