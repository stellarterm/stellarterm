import Printify from '../../../../../../lib/Printify';
import directory from '../../../../../../../directory';
/*
  4 general categories (DATA_TYPES) (account, signer, trade, trustline)

  Each func returns an object with the following properties that are then
  placed within a template that is returned and exported:

   1) title: the title of the action, ex: Account Created
   2) attributes: an array of attribute objects related to the effect
    a. header: the attribute label, ex: "STARTING BALANCE: "
    b. value: the attribute value, ex: "2828.292929200"
    c. isAsset(optional): Speficies if the attribute represents an asset.
                          This is used for special formatting within the
                          template including the hover property which is
                          used to show asset cards.
    data. asset_code(optional)
    e. asset_issuer(optional)
    f. domain(optional)
*/
const DATA_TYPES = ['account', 'signer', 'trade', 'trustline'];
const ACCOUNT_CATEGORIES = [
    'account_created', 'account_inflation_destination_updated', 'account_home_domain_updated',
    'account_flags_updated', 'account_thresholds_updated', 'transaction_history'];

const HISTORY_DATA_GENERATORS = {
    account_created: data => ({
        title: 'Account Created',
        attributes: [
            {
                header: 'STARTING BALANCE: ',
                value: Printify.lightenZeros(data.starting_balance),
                isAsset: true,
                asset_code: 'XLM',
                asset_issuer: null,
                domain: 'native',
            },
            {
                header: 'FUNDED BY: ',
                value: data.funder,
            },
        ],
    }),

    account_inflation_destination_updated: data => ({
        title: 'Inflation destination updated',
        attributes: [
            {
                header: 'INFLATION DEST: ',
                value: data.inflation_dest,
            },
        ],
    }),

    account_home_domain_updated: data => ({
        title: 'Home Domain updated',
        attributes: [
            {
                header: 'NEW DOMAIN: ',
                value: data.home_domain,
            },
        ],
    }),

    account_flags_updated: ({ set_flags_s: setFlagsStrings, clear_flags_s: clearFlagsStrings }) => {
        const setFlags = setFlagsStrings ?
            setFlagsStrings.map(flag => `set_flag_${flag}`).join(', ') :
            '';
        const clearFlags = clearFlagsStrings ?
            clearFlagsStrings.map(flag => `clear_flag_${flag}`).join(', ') :
            '';

        return {
            title: 'Flags updated',
            attributes: [
                {
                    header: 'FLAGS: ',
                    value: setFlags + clearFlags,
                },
            ],
        };
    },

    account_thresholds_updated: data => ({
        title: 'Thresholds Weights updated',
        attributes: [
            {
                header: 'HIGH: ',
                value: data.high_threshold,
            },
            {
                header: 'MEDIUM: ',
                value: data.med_threshold,
            },
            {
                header: 'LOW: ',
                value: data.low_threshold,
            },
        ],
    }),

    transaction_history: (data) => {
        let toFromRow = {};
        let title;

        if (data.to && data.from && data.to === data.from && data.category === 'account_debited') {
            return {
                title: 'Sent to self',
                attributes: [
                    {
                        header: 'AMOUNT: ',
                        value: Printify.lightenZeros(data.amount),
                        isAsset: true,
                        asset_code: data.asset_code,
                        asset_issuer: data.asset_issuer,
                        domain: data.asset_code
                            ? directory.resolveAssetByAccountId(data.asset_code, data.asset_issuer).domain
                            : 'native',
                    },
                    {
                        header: 'TO: ',
                        value: `${data.to} (self)`,
                    },
                    {
                        header: 'FROM:  ',
                        value: `${data.from} (self)`,
                    },
                ],
            };
        }

        if (data.funder && data.starting_balance && data.category === 'account_debited') {
            const envelopeResult = StellarSdk.xdr.TransactionEnvelope.fromXDR(data.envelope_xdr.toString(), 'base64');
            const publicKeyUint8Array = envelopeResult._attributes.tx._attributes.operations[0]
                        ._attributes.body._value._attributes.destination._value;
            const publicKey = StellarSdk.StrKey.encodeEd25519PublicKey(publicKeyUint8Array);

            return {
                title: 'Account Created',
                attributes: [
                    {
                        header: 'STARTING BALANCE: ',
                        value: Printify.lightenZeros(data.starting_balance),
                        isAsset: true,
                        asset_code: 'XLM',
                        asset_issuer: null,
                        domain: 'native',
                    },
                    {
                        header: 'FUNDED TO: ',
                        value: publicKey,
                    },
                ],
            };
        }

        if (data.category === 'account_debited') {
            title = 'Sent';
            toFromRow = {
                header: 'TO: ',
                value: data.to,
            };
        } else {
            title = 'Received';
            toFromRow = {
                header: data.category === 'account_debited' ? 'TO:  ' : 'FROM:  ',
                value: data.from,
            };
        }

        return {
            title,
            attributes: [
                {
                    header: 'AMOUNT: ',
                    value: Printify.lightenZeros(data.amount),
                    isAsset: true,
                    asset_code: data.asset_code,
                    asset_issuer: data.asset_issuer,
                    domain: data.asset_code
                        ? directory.resolveAssetByAccountId(data.asset_code, data.asset_issuer).domain
                        : 'native',
                },
                toFromRow,
            ],
        };
    },

    signer: (data) => {
        const action = data.category.split('_')[1];

        if (data.inflation_dest) {
            return {
                title: 'Inflation set',
                attributes: [
                    {
                        header: 'INFLATION DEST: ',
                        value: data.inflation_dest,
                    },
                ],
            };
        }

        return {
            title: `Signer ${action}`,
            attributes: [
                {
                    header: 'KEY WEIGHT: ',
                    value: data.weight,
                },
                {
                    header: 'KEY: ',
                    value: data.public_key,
                },
            ],
        };
    },

    trade: data => ({
        title: 'Traded',
        attributes: [
            {
                header: 'SOLD: ',
                value: Printify.lightenZeros(data.sold_amount),
                isAsset: true,
                asset_code: data.sold_asset_code,
                asset_issuer: data.sold_asset_issuer,
                domain: data.sold_asset_code
                    ? directory.resolveAssetByAccountId(data.sold_asset_code, data.sold_asset_issuer).domain
                    : 'native',
            },
            {
                header: 'BOUGHT: ',
                value: Printify.lightenZeros(data.bought_amount),
                isAsset: true,
                asset_code: data.bought_asset_code,
                asset_issuer: data.bought_asset_issuer,
                domain: data.bought_asset_code
                    ? directory.resolveAssetByAccountId(data.bought_asset_code, data.bought_asset_issuer).domain
                    : 'native',
            },
        ],
    }),

    trustline: data => ({
        title: `Trustline ${data.category.split('_')[1]}`,
        attributes: [
            {
                header: 'ASSET: ',
                value: '',
                isAsset: true,
                asset_code: data.asset_code,
                asset_issuer: data.asset_issuer,
                domain: directory.resolveAssetByAccountId(data.asset_code, data.asset_issuer).domain,
            },
            {
                header: 'ADDRESS: ',
                value: data.asset_issuer,
            },
        ],
    }),
};

export function getHistoryRowsData(historyType = '', data = {}) {
    const dataGenerator = HISTORY_DATA_GENERATORS[historyType];
    if (!dataGenerator) {
        throw new Error(`Can not generate history data for provided type: ${historyType}`);
    }

    return dataGenerator(data);
}

export function checkDataType(type, category) {
    const isNotAccountType = type !== 'account';
    const typeExists = DATA_TYPES.indexOf(type) !== -1;

    if (isNotAccountType && typeExists) {
        return type;
    } else if (isNotAccountType && !typeExists) {
        console.warn(`You provide unsupported History type: ${type}. You need to add it to properly display history`);
        return null;
    }

    const categoryExists = category && ACCOUNT_CATEGORIES.indexOf(category) !== -1;
    return categoryExists ? category : 'transaction_history';
}
