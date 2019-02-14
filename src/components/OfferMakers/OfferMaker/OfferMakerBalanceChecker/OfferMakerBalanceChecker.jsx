

export default function OfferMakerBalanceChecker(d, side, total, amount) {
    const login = d.session.state === 'in';
    const isBuy = side === 'buy';
    const { baseBuying, counterSelling } = d.orderbook.data;
    const trustNeededAssets = [];

    let insufficientBalance = false;
    let targetCode = '';
    let targetBalance = '';

    if (login) {
        const baseBalance = d.session.account.getBalance(baseBuying);
        const counterBalance = d.session.account.getBalance(counterSelling);

        if (baseBalance === null) {
            trustNeededAssets.push(baseBuying);
        }

        if (counterBalance === null) {
            trustNeededAssets.push(counterSelling);
        }

        const targetAsset = isBuy ? counterSelling : baseBuying;
        targetCode = targetAsset.getCode();


        targetBalance = isBuy ? counterBalance : baseBalance;
        if (targetAsset.isNative()) {
            targetBalance = d.session.account.maxLumenSpend();
        }

        const inputSpendAmount = isBuy ? total : amount;

        if (Number(inputSpendAmount) > Number(targetBalance)) {
            insufficientBalance = true;
        }
    }

    const result = {
        code: targetCode,
        balance: targetBalance,
        insufficient: insufficientBalance,
        trustNeeded: trustNeededAssets,
    };

    return (result);
}
