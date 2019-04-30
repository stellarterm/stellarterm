import Event from '../Event';

export default function History(driver) {
    this.event = new Event();
    this.history = { records: [], details: {}, moreRecords: null };
    this.loadMore = false;
    this.isLoading = false;
    this.allLoaded = false;
    this.loadLimit = 10;

    this.handlers = {
        loadHistory: async (loadMore) => {
            this.loadMore = loadMore;
            if (this.loadMore && !this.isLoading && !this.allLoaded) {
                await this.handlers.loadRecordsWithLimit(driver.Server, driver.session.account.account_id);
            }
        },
        loadRecordsWithLimit: async (Server, publicKey) => {
            if (this.history.moreRecords === null) {
                // First init loading
                this.history.moreRecords = await this.handlers.getOperations(this.loadLimit);
            } else if (this.loadMore && !this.isLoading && !this.allLoaded) {
                this.history.moreRecords = await this.history.moreRecords.next();
            }

            if (this.history.moreRecords.records.length !== 0 && !this.isLoading) {
                this.isLoading = true;
                this.history.records = this.history.records.concat(this.history.moreRecords.records);
                this.handlers.loadRecordsWithLimit(Server, publicKey);
                this.handlers.getOperationDetails();
            } else if (this.history.moreRecords.records.length === 0) {
                this.allLoaded = true;
                this.event.trigger();
            }
        },
        getOperationDetails: async () => {
            let fetchTarget = null;
            for (let i = 0; i < this.history.records.length; i++) {
                const record = this.history.records[i];
                if (fetchTarget === null && this.history.details[record.id] === undefined) {
                    fetchTarget = i;
                }
            }

            if (fetchTarget !== null) {
                this.isLoading = true;
                const record = this.history.records[fetchTarget];
                const operation = await record.operation();
                const transaction = await operation.transaction();
                record.category = record.type;
                this.history.details[record.id] = Object.assign(operation, transaction, record);
                this.handlers.getOperationDetails();
            } else {
                this.isLoading = false;
                this.loadMore = false;
                if (this.loadMore && !this.isLoading) {
                    this.handlers.loadHistory(true);
                }
            }
            this.event.trigger();
        },
        listenNewTransactions: async (Server, publicKey) => {
            Server.operations()
                .forAccount(publicKey)
                .cursor('now')
                .stream({
                    onmessage: this.handlers.newOperationCallback,
                });
        },
        newOperationCallback: async () => {
            const lastOperation = await this.handlers.getOperations(1);

            if (lastOperation.records.length !== 0) {
                this.history.records = lastOperation.records.concat(this.history.records);
                this.handlers.getOperationDetails();
            }
        },
        getOperations: async (opLimit) => {
            const opsResult = await driver.Server.effects()
                .forAccount(driver.session.account.account_id)
                .limit(opLimit)
                .order('desc')
                .call();
            return opsResult;
        },
    };
}
