import { getOperationToastTemplate } from '../../components/ToastTemplate/AccountEventsTemplates';

export default class AccountEvents {
    constructor(driver) {
        this.driver = driver;

        this.isLoading = false;
        this.initLoading = false;
        this.unlistenAccountEvents = null;
    }

    restartAccountEventsListening(Server, publicKey) {
        if (!this.unlistenAccountEvents) {
            return;
        }

        this.unlistenAccountEvents();

        this.listenAccountEvents(Server, publicKey);
    }

    async listenAccountEvents(Server, publicKey) {
        this.initLoading = true;
        const lastOperation = await this.getOperations(1);
        this.lastOpTime = new Date(lastOperation.records[0].created_at).getTime();

        this.unlistenAccountEvents = Server.effects()
            .forAccount(publicKey)
            .cursor('now')
            .stream({
                onmessage: () => this.newEffectCallback(),
            });
        this.initLoading = false;
    }

    async newEffectCallback() {
        if (this.isLoading) { return; }
        this.isLoading = true;
        const lastOperations = await this.getOperations(20);
        this.isLoading = false;

        if (this.lastOpTime === new Date(lastOperations.records[0].created_at).getTime()) { return; }

        const opsToShow = lastOperations.records.map(op => {
            const opTime = new Date(op.created_at).getTime();
            if (this.lastOpTime >= opTime) { return null; }
            return op;
        }).filter(op => op !== null);

        opsToShow.forEach(op => {
            const template = getOperationToastTemplate(op);
            if (template) {
                this.driver.toastService.successTemplate(template);
            }
        });

        this.lastOpTime = new Date(opsToShow[0].created_at).getTime();
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
