import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Debounce from 'awesome-debounce-promise/dist/index';
import Stellarify from '../../../lib/Stellarify';
import Driver from '../../../lib/Driver';
import MessageRow from './MessageRow/MessageRow';
import Ellipsis from '../Ellipsis/Ellipsis';
import AssetRow from '../AssetRow/AssetRow';

const DEBOUNCE_TIME = 700;
const resolveAnchor = Debounce(StellarSdk.StellarTomlResolver.resolve, DEBOUNCE_TIME);
const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const regexp = new RegExp(pattern);

export default class SearchByAnchor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorDomain: '',
            allCurrencies: [],
            resolveState: '',
        };
    }

    async getAssetsFromUrl(domain) {
        try {
            const resolvedAnchor = await resolveAnchor(domain);
            const { anchorDomain } = this.state;
            if (domain !== anchorDomain) {
                return;
            }

            if (!resolvedAnchor.CURRENCIES) {
                this.setState({
                    resolveState: 'without_currencies',
                    allCurrencies: [],
                });
                return;
            }

            this.setState({
                resolveState: 'found',
                allCurrencies: resolvedAnchor.CURRENCIES,
            });
        } catch (e) {
            const { anchorDomain } = this.state;

            if (domain !== anchorDomain) {
                return;
            }

            this.setState({
                resolveState: 'notfound',
                allCurrencies: [],
            });
        }
    }

    handleInputFederation({ target }) {
        const anchorDomain = target.value;
        if (anchorDomain && !regexp.test(anchorDomain)) {
            this.setState({
                allCurrencies: [],
                resolveState: 'invalid_domain',
                anchorDomain,
            });
            return;
        }
        const resolveState = anchorDomain ? 'pending' : '';

        this.setState({
            allCurrencies: [],
            resolveState,
            anchorDomain,
        });

        if (anchorDomain) {
            this.getAssetsFromUrl(anchorDomain);
        }
    }

    render() {
        const { resolveState, anchorDomain, allCurrencies } = this.state;
        let assetResults;
        let assetsAmount;

        switch (resolveState) {
        case 'notfound':
            assetResults = (
                <MessageRow isError>
                    <span>Unable to find currencies for {anchorDomain}</span>
                </MessageRow>
            );
            break;
        case 'invalid_domain':
            assetResults = (
                <MessageRow isError>
                    <span>Please enter a valid domain name</span>
                </MessageRow>
            );
            break;
        case 'without_currencies':
            assetResults = (
                <MessageRow isError>
                    <span>No currencies found in the stellar.toml file</span>
                </MessageRow>
            );
            break;
        case 'pending':
            assetResults = (
                <MessageRow>
                    <span>Loading currencies for {anchorDomain}</span>
                    <Ellipsis />
                </MessageRow>
            );
            break;
        case 'found':
            assetResults = allCurrencies.map((currency) => {
                const { code, issuer } = currency;
                const assetIsUndefined = code === undefined || issuer === undefined;
                const issuerInvalid = !StellarSdk.StrKey.isValidEd25519PublicKey(issuer);

                if (assetIsUndefined || issuerInvalid) {
                    return null;
                }

                const asset = Stellarify.assetToml(currency);

                const key = currency.code + currency.issuer;
                return (
                    <AssetRow
                        key={key}
                        d={this.props.d}
                        tradeLink={this.props.tradeLink}
                        asset={asset}
                        currency={currency}
                        host={anchorDomain} />
                );
            });
            assetsAmount = assetResults.filter(asset => asset !== null).length;
            assetResults = this.props.tradeLink ?
                <div className="AssetRow_flex3">{assetResults}</div> :
                <div className="AssetRowContainer">{assetResults}</div>;
            break;
        default:
            break;
        }

        const noAssetsForDomain = assetsAmount !== undefined && assetsAmount === 0;
        assetResults = noAssetsForDomain ? (
            <MessageRow isError>
                <span>Unable to find currencies for {anchorDomain}</span>
            </MessageRow>
        ) : (
            assetResults
        );

        return (
            <div className="island">
                <div className="island__paddedContent">
                    <p className="anchor_Search_title">Discover assets issued by anchor and trade them</p>
                    <label className="s-inputGroup AddTrust_inputGroup" htmlFor="anchorDomainInput">
                        <input
                            className="s-inputGroup__item S-flexItem-share"
                            type="text"
                            name="anchorDomainInput"
                            value={anchorDomain}
                            onChange={e => this.handleInputFederation(e)}
                            placeholder="Enter the anchor domain name to see issued assets
                             (e.g. www.anchorusd.com, apay.io, etc)" />
                    </label>
                </div>
                {assetResults}
            </div>
        );
    }
}

SearchByAnchor.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    tradeLink: PropTypes.bool,
};
