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

    filteredBids.reverse();

    return {
        asks: [
            ...filteredAsks,
            ...new Array(200 - filteredAsks.length).fill(filteredAsks[filteredAsks.length - 1]),
        ],
        bids: [
            ...new Array(200 - filteredBids.length).fill(filteredBids[0]),
            ...filteredBids,
        ],
    };
}
