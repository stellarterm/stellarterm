import Event from '../Event';

export default class History {
    constructor(driver) {
        this.event = new Event();
        this.driver = driver;

        this.popupHistory = [];
        this.isLoading = false;
        this.lastOpTime = 0;
    }

    cleanSessionHistory() {
        this.popupHistory = [];
    }

    async listenNewTransactions(Server, publicKey) {
        const lastOperation = await this.getOperations(1);
        this.lastOpTime = new Date(lastOperation.records[0].created_at).getTime();

        Server.effects()
            .forAccount(publicKey)
            .cursor('now')
            .stream({
                onmessage: () => this.newEffectCallback(),
            });
    }

    async newEffectCallback() {
        if (this.isLoading) { return; }
        this.isLoading = true;
        const lastOperations = await this.getOperations(20);
        this.isLoading = false;

        if (this.lastOpTime === new Date(lastOperations.records[0].created_at).getTime()) { return; }

        const opsToShow = lastOperations.records.map((op) => {
            const opTime = new Date(op.created_at).getTime();
            if (this.lastOpTime >= opTime) { return null; }
            return op;
        }).filter(op => op !== null);

        this.popupHistory = opsToShow.concat(this.popupHistory);
        this.lastOpTime = new Date(opsToShow[0].created_at).getTime();
        this.event.trigger();
    }

    async getOperations(opLimit) {
        return this.driver.Server.effects()
            .forAccount(this.driver.session.account.account_id)
            .limit(opLimit)
            .order('desc')
            .call();
    }

    async getPaymentsHistory(opLimit) {
        return this.driver.Server.payments()
            .forAccount(this.driver.session.account.account_id)
            .limit(opLimit)
            .order('desc')
            .call();
    }
}
