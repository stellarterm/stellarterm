import { getOnClickAction, getOperationToastTemplate } from '../../components/ToastTemplate/AccountEventsTemplates';
import Event from '../Event';

export default class AccountEvents {
    constructor(driver) {
        this.driver = driver;

        this.event = new Event();

        this.isLoading = false;
        this.unlistenAccountEvents = null;
    }

    get streamInitialized() {
        return Boolean(this.unlistenAccountEvents);
    }

    restartAccountEventsListening(Server, publicKey) {
        if (!this.streamInitialized) {
            return;
        }

        this.stopListenAccountEvents();

        this.unlistenAccountEvents = null;

        this.listenAccountEvents(Server, publicKey);
    }

    async listenAccountEvents(Server, publicKey) {
        const lastOperation = await this.driver.effects.getOperations(1);
        this.lastOpTime = new Date(lastOperation.records[0].created_at).getTime();

        this.unlistenAccountEvents = Server.effects()
            .forAccount(publicKey)
            .cursor('now')
            .stream({
                onmessage: res => {
                    if (res.type === 'claimable_balance_claimant_created' ||
                        res.type === 'claimable_balance_claimed'
                    ) {
                        this.driver.claimableBalances.updateClaimableBalances();
                    }
                    this.newEffectCallback();
                },
            });
    }

    stopListenAccountEvents() {
        if (this.streamInitialized) {
            this.unlistenAccountEvents();
        }
    }

    async newEffectCallback() {
        const lastOperations = await this.driver.effects.debouncedUpdateLatestEffects();
        this.driver.payments.debouncedUpdateLatestPayments();

        if (this.lastOpTime === new Date(lastOperations[0].created_at).getTime()) { return; }

        const opsToShow = lastOperations.map(op => {
            const opTime = new Date(op.created_at).getTime();
            if (this.lastOpTime >= opTime) { return null; }
            return op;
        }).filter(op => op !== null);

        opsToShow.forEach(op => {
            const template = getOperationToastTemplate(op);

            const onClick = getOnClickAction(this.driver, op);

            if (template) {
                this.driver.toastService.successTemplate(template, onClick);
            }
        });

        this.lastOpTime = new Date(opsToShow[0].created_at).getTime();
    }
}
