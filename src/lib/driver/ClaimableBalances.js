import Event from '../Event';
import { getAvailableClaimsCount, getNextClaimTime } from '../claimableBalancesHelpers';

const LAST_SEEN_CLAIMABLE_BALANCE_ALIAS = 'lastSeenClaimableBalance';


export default class ClaimableBalances {
    constructor(driver) {
        this.driver = driver;

        this.event = new Event();

        this.loading = false;
        this.isFullLoaded = false;

        this.pendingClaimableBalances = [];
        this.pendingClaimableBalancesCount = 0;

        this.nextClaimableBalancesRequest = null;

        this.lastCanClaimBalance = null;
        this.lastSeenClaimableBalances = JSON.parse(localStorage.getItem(LAST_SEEN_CLAIMABLE_BALANCE_ALIAS) || '{}');
        this.hasBanner = false;

        this.driver.session.event.sub(() => {
            this.getAccountId();
        });
    }

    getAccountId() {
        switch (this.driver.session.state) {
            case 'in': {
                this.accountId = this.driver.session.account.account_id;
                break;
            }
            case 'unfunded': {
                this.accountId = this.driver.session.unfundedAccountId;
                break;
            }
            default:
                this.accountId = null;
        }
    }

    getClaimableBalances() {
        if (!this.accountId) {
            return;
        }

        this.loading = true;

        this.driver.Server.claimableBalances()
            .claimant(this.accountId)
            .limit(200)
            .order('desc')
            .call()
            .then(result => {
                this.pendingClaimableBalances = result.records;
                this.pendingClaimableBalancesCount =
                    getAvailableClaimsCount(this.pendingClaimableBalances, this.accountId);
                this.nextClaimableBalancesRequest = result.next;
                this.isFullLoaded = result.records.length === 0;
                this.loading = false;
                this.event.trigger();

                const canClaimClaimableBalances = this.pendingClaimableBalances
                    .filter(({ claimants }) => {
                        const { canClaim } = getNextClaimTime(
                            claimants.find(({ destination }) => destination === this.accountId).predicate,
                            Date.now(),
                        );
                        return canClaim;
                    });

                this.lastCanClaimBalance = canClaimClaimableBalances[0];

                if (!this.lastCanClaimBalance || !this.pendingClaimableBalancesCount) {
                    this.hasBanner = false;
                    this.event.trigger();
                    return;
                }

                if (
                    !this.lastSeenClaimableBalances ||
                    !this.lastSeenClaimableBalances[this.accountId] ||
                    (new Date(this.lastCanClaimBalance.last_modified_time) >
                        new Date(this.lastSeenClaimableBalances[this.accountId])
                    )
                ) {
                    this.hasBanner = true;
                    this.event.trigger();
                }
            });
    }

    loadMore() {
        if (this.isFullLoaded || !this.nextClaimableBalancesRequest) {
            return;
        }
        this.loading = true;

        this.nextClaimableBalancesRequest().then(result => {
            this.pendingClaimableBalances = [...this.pendingClaimableBalances, ...result.records];
            this.pendingClaimableBalancesCount =
                getAvailableClaimsCount(this.pendingClaimableBalances, this.accountId);
            this.nextClaimableBalancesRequest = result.next;
            this.isFullLoaded = result.records.length === 0;

            this.loading = false;

            this.event.trigger();
        });
    }

    updateClaimableBalances() {
        this.isFullLoaded = false;
        this.pendingClaimableBalances = [];

        this.getClaimableBalances();
    }

    getClaimableBalance(id) {
        return this.driver.Server.claimableBalances()
            .claimableBalance(id)
            .call();
    }

    hideBanner() {
        if (!this.pendingClaimableBalances.length || !this.lastCanClaimBalance) {
            return;
        }

        this.lastSeenClaimableBalances[this.accountId] = this.lastCanClaimBalance.last_modified_time;

        localStorage.setItem(LAST_SEEN_CLAIMABLE_BALANCE_ALIAS, JSON.stringify(this.lastSeenClaimableBalances));

        this.hasBanner = false;

        this.event.trigger();
    }
}
