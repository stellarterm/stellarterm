import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from '@stellar/stellar-sdk';
import Debounce from 'awesome-debounce-promise/dist/index';
import Stellarify from '../../../lib/helpers/Stellarify';
import Driver from '../../../lib/driver/Driver';
import Ellipsis from '../Ellipsis/Ellipsis';
import AssetRow from '../AssetRow/AssetRow';
import MessageRow from './MessageRow/MessageRow';

const DEBOUNCE_TIME = 700;
const resolveAnchor = Debounce(StellarSdk.StellarToml.Resolver.resolve, DEBOUNCE_TIME);
const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const regexp = new RegExp(pattern, 'i');

export default class SearchByAnchor extends React.Component {
    constructor(props) {
        super(props);
        this.urlSearchParams = new URLSearchParams(window.location.search);

        this.state = {
            anchorDomain: (this.props.withUrlParams && this.urlSearchParams.get('search')) || '',
            allCurrencies: [],
            resolveState: '',
        };
    }

    componentDidMount() {
        if (!this.props.withUrlParams) {
            return;
        }

        if (this.state.anchorDomain) {
            this.getAssetsFromUrl(this.state.anchorDomain);
        }


        this.unlisten = this.props.history.listen((location, action) => {
            this.urlSearchParams = new URLSearchParams(location.search);

            if (action === 'POP' && this.urlSearchParams.get('search') !== this.state.anchorDomain) {
                this.setState({ anchorDomain: this.urlSearchParams.get('search') || '', resolveState: '' });
                this.getAssetsFromUrl(this.state.anchorDomain);
            }
        });
    }

    componentWillUnmount() {
        if (this.props.withUrlParams) {
            this.unlisten();
        }
    }

    async getAssetsFromUrl(domain) {
        if (!domain) {
            return;
        }
        if (!regexp.test(domain)) {
            this.setState({
                resolveState: 'invalid_domain',
            });
            return;
        }

        this.setState({ resolveState: 'pending' });

        try {
            const domainToFetch = domain.replace(/^https?:\/\/|\/$/g, '');

            const resolvedAnchor = await resolveAnchor(domainToFetch);

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

        this.setState({ anchorDomain, allCurrencies: [], resolveState: '' });

        this.getAssetsFromUrl(anchorDomain);

        if (!this.props.withUrlParams) {
            return;
        }

        if (anchorDomain) {
            this.urlSearchParams.set('search', anchorDomain);
        } else {
            this.urlSearchParams.delete('search');
        }

        this.props.history.replace(`?${this.urlSearchParams.toString()}`);
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
                assetResults = allCurrencies.map(currency => {
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
                        />
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
                             (e.g. ultracapital.xyz, aqua.network, etc)"
                        />
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
    history: PropTypes.objectOf(PropTypes.any),
    withUrlParams: PropTypes.bool,
};
