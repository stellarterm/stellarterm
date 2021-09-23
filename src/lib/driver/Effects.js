import Debounce from 'awesome-debounce-promise';
import Event from '../Event';

export const EFFECTS_EVENTS = {
    START_REQUEST: 'start request',
    GET_HISTORY_REQUEST: 'get history request',
    NEXT_HISTORY_REQUEST: 'next history request',
    UPDATE_HISTORY_REQUEST: 'update history request',
};

const UPDATE_DEPS = 30;


export default class Effects {
    constructor(driver) {
        this.driver = driver;

        this.event = new Event();
        this.isFullLoaded = false;

        this.loading = false;

        this.effectsHistory = [];
        this.nextEffectsHistoryRequest = null;

        this.debouncedUpdateLatestEffects = Debounce(this.updateLatestEffects.bind(this), 700);
    }

    getEffectsHistory() {
        this.loading = true;
        this.event.trigger({ type: EFFECTS_EVENTS.START_REQUEST });

        this.getOperations(200)
            .then(result => {
                this.effectsHistory = result.records;
                this.nextEffectsHistoryRequest = result.next;
                this.loading = false;
                this.event.trigger({ type: EFFECTS_EVENTS.GET_HISTORY_REQUEST });
            });
    }

    loadMoreHistory() {
        if (!this.nextEffectsHistoryRequest || this.isFullLoaded || this.loading) {
            return;
        }

        this.loading = true;
        this.event.trigger({ type: EFFECTS_EVENTS.START_REQUEST });

        this.nextEffectsHistoryRequest().then(result => {
            this.effectsHistory = [...this.effectsHistory, ...result.records];
            this.nextEffectsHistoryRequest = result.next;
            this.isFullLoaded = result.records.length === 0;
            this.loading = false;
            this.event.trigger({
                type: EFFECTS_EVENTS.NEXT_HISTORY_REQUEST,
                newItems: result.records,
            });
        });
    }

    updateLatestEffects() {
        return this.getOperations(UPDATE_DEPS)
            .then(result => {
                const { records } = result;

                if (!this.effectsHistory.length) {
                    return records;
                }

                const firstHistoryId = this.effectsHistory[0].id;

                const recordsFirstCommonIndex = records.findIndex(record => record.id === firstHistoryId);

                this.effectsHistory = [...records.slice(0, recordsFirstCommonIndex), ...this.effectsHistory];

                this.event.trigger({
                    type: EFFECTS_EVENTS.UPDATE_HISTORY_REQUEST,
                });

                return records;
            });
    }


    getOperations(opLimit) {
        return this.driver.Server.effects()
            .forAccount(this.driver.session.account.account_id)
            .limit(opLimit)
            .order('desc')
            .call();
    }

    resetEffects() {
        this.isFullLoaded = false;
        this.loading = false;
        this.effectsHistory = [];
        this.nextEffectsHistoryRequest = null;
    }
}
