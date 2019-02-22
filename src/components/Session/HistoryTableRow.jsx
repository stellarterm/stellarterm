/*
  This file contains the Effect Card Component.
  It deals with each effect with a nested switch
  statement. This nested switch statement is
  formated as so:

  outside switch: general category (account, signer, trade, trustline)

  inside switch: per category (ie for account have a switch for
                               home domain update, thresholds update, etc.)

  The reasoning behind this design is modularity. If, in the future,
  another effect is added, it simply requires adding another case to
  the switch statement.

  Each case returns an object with the following properties that are then
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
import React from 'react';
import PropTypes from 'prop-types';
import Printify from '../../lib/Printify';
import AssetCard2 from '../AssetCard2';
import directory from '../../directory';
import HistoryRowExternal from './HistoryRowExternal';

export default class HistoryTableRow extends React.Component {
    getHistorySigner() {
        const { data } = this.props;
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
    }

    getHistoryTrade() {
        const { data } = this.props;

        return {
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
        };
    }

    getHistoryTrustLine() {
        const { data } = this.props;

        return {
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
        };
    }

    getAccountHistory() {
        const { data } = this.props;

        switch (data.category) {
            // ACCOUNT CREATED
            // Returns a component with the starting balance and the funding public key.
        case 'account_created':
            return this.getCreatedHistory();
            // INFLATION DESTINATION UPDATED
            // Returns a component with iflation destination address
        case 'account_inflation_destination_updated':
            return this.getInflationUpdateHistory();
            // HOME DOMAIN UPDATED
            // Returns a component with the name of the new home domain.
        case 'account_home_domain_updated':
            return this.getHomeDomainUpdateHistory();
            // FLAGS UPDATED
            // Returns a component listing the updated flags (both set and/or clear).
        case 'account_flags_updated':
            return this.getFlagsUpdateHistory();
            // THRESHOLDS UPDATED
            // Returns a component with the updated thresholds
        case 'account_thresholds_updated':
            return this.getThresholdsUpdateHistory();
            // SELF SENT, CREDITED and DEBITED
            // Returns a component with the asset, the amount, and the source/destination
        default:
            return this.getTransactionsHistory();
        }
    }

    getCreatedHistory() {
        const { data } = this.props;

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
                    header: 'FUNDED BY: ',
                    value: data.funder,
                },
            ],
        };
    }

    getInflationUpdateHistory() {
        const { data } = this.props;

        return {
            title: 'Inflation destination updated',
            attributes: [
                {
                    header: 'INFLATION DEST: ',
                    value: data.inflation_dest,
                },
            ],
        };
    }

    getHomeDomainUpdateHistory() {
        const { data } = this.props;

        return {
            title: 'Home Domain updated',
            attributes: [
                {
                    header: 'NEW DOMAIN: ',
                    value: data.home_domain,
                },
            ],
        };
    }

    getFlagsUpdateHistory() {
        const { data } = this.props;
        const setFlags = data.set_flags_s ? data.set_flags_s.map(flag => `set_flag_${flag}`).join(', ') : '';
        const clearFlags = data.clear_flags_s ? data.clear_flags_s.map(flag => `clear_flag_${flag}`).join(', ') : '';

        return {
            title: 'Flags updated',
            attributes: [
                {
                    header: 'FLAGS: ',
                    value: setFlags + clearFlags,
                },
            ],
        };
    }

    getThresholdsUpdateHistory() {
        const { data } = this.props;

        return {
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
        };
    }

    getTransactionsHistory() {
        const { data } = this.props;
        let toFromRow = {};
        let title;

        if (data.to === data.from && data.category === 'account_debited') {
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
    }

    render() {
        const { data, type } = this.props;
        let historyRows;

        switch (type) {
        case 'account':
            historyRows = this.getAccountHistory();
            break;
        case 'signer':
            historyRows = this.getHistorySigner();
            break;
        case 'trade':
            historyRows = this.getHistoryTrade();
            break;
        case 'trustline':
            historyRows = this.getHistoryTrustLine();
            break;
        default:
            break;
        }

        const history = historyRows.attributes.map(row => (
            <div key={`${row.header}${row.value}`} className="HistoryView__card__line">
                <span className="HistoryView__card__container__header">{row.header} </span> {row.value}
                {row.isAsset ? (
                    <span className="HistoryView__asset">
                        {row.asset_code || 'XLM'}-{row.domain}
                        <div className="HistoryView__asset__card">
                            <AssetCard2 code={row.asset_code || 'XLM'} issuer={row.asset_issuer || null} />
                        </div>
                    </span>
                ) : ('')}
            </div>
        ));

        return (
            <div className="HistoryView__card">
                <div className="HistoryView__card__container">
                    <h3 className="HistoryView__card__container__title">{historyRows.title}</h3>

                    {history}
                    <HistoryRowExternal hash={data.transaction_hash} />
                </div>
            </div>
        );
    }
}

HistoryTableRow.propTypes = {
    data: PropTypes.instanceOf(Object).isRequired,
    type: PropTypes.string.isRequired,
};
