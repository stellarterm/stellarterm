const COEFFICIENT_FROM_SPREAD = 2; // 200%

function filterOutliersOrderbookData(asks, bids) {
    const minValue = Number(bids[0].price) / COEFFICIENT_FROM_SPREAD;
    const maxValue = Number(asks[0].price) * COEFFICIENT_FROM_SPREAD;

    return {
        asks: asks.filter(x => (Number(x.price) <= maxValue)),
        bids: bids.filter(x => (Number(x.price) >= minValue)),
    };
}

export default function processOrderbook(asks, bids) {
    const { asks: filteredAsks, bids: filteredBids } = filterOutliersOrderbookData(asks, bids);

    // check for a thin orderbook
    if (filteredAsks.length < 2 || filteredBids.length < 2) {
        return { asks: filteredAsks, bids: filteredBids };
    }

    let sumAsks = 0;
    let sumAsksReverse = 0;

    const processedAsks = filteredAsks.map(ask => {
        sumAsks += Number(ask.amount) * Number(ask.price);
        sumAsksReverse += Number(ask.amount);

        return {
            ...ask,
            sum: sumAsks,
            sumReverse: sumAsksReverse,
        };
    });

    let sumBids = 0;
    let sumBidsReverse = 0;

    const processedBids = filteredBids.map(bid => {
        sumBids += Number(bid.amount);
        sumBidsReverse += Number(bid.amount) / Number(bid.price);

        return {
            ...bid,
            sum: sumBids,
            sumReverse: sumBidsReverse,
        };
    });

    processedBids.reverse();

    return {
        asks: [
            ...processedAsks,
            ...new Array(200 - processedAsks.length).fill(processedAsks[processedAsks.length - 1]),
        ],
        bids: [
            ...new Array(200 - processedBids.length).fill(processedBids[0]),
            ...processedBids,
        ],
    };
}
