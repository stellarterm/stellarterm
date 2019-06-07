import React from 'react';
import PropTypes from 'prop-types';
import Debounce from 'awesome-debounce-promise/dist/index';
import Stellarify from '../../../lib/Stellarify';
import Driver from '../../../lib/Driver';
import MessageRow from './MessageRow/MessageRow';
import Ellipsis from '../Ellipsis/Ellipsis';
import AssetRow from '../AssetRow/AssetRow';

const DEBOUNCE_TIME = 700;
const resolveAnchor = Debounce(StellarSdk.StellarTomlResolver.resolve, DEBOUNCE_TIME);
const pattern = '^(https?:\\/\\/)?' + // protocol
    '((([a-zA-Z\\d]([a-zA-Z\\d-]{0,61}[a-zA-Z\\d])*\\.)+' + // sub-domain + domain name
    '[a-zA-Z]{2,13})' + // extension
    '|((\\d{1,3}\\.){3}\\d{1,3})' + // OR ip (v4) address
    '|localhost)' + // OR localhost
    '(\\:\\d{1,5})?' + // port
    '(\\/[a-zA-Z\\&\\d%_.~+-:@]*)*' + // path
    '(\\?[a-zA-Z\\&\\d%_.,~+-:@=;&]*)?' + // query string
    '(\\#[-a-zA-Z&\\d_]*)?$'; // fragment locator
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
                        <span>Invalid domain {anchorDomain}</span>
                    </MessageRow>
                );
            break;
        case 'without_currencies':
            assetResults = (
                    <MessageRow isError>
                        <span>Domain {anchorDomain} is known for Stellar, but no currencies found</span>
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

        const headerTitle = this.props.tradeLink ?
            'Explore via anchor domain' :
            'Accept asset via anchor domain';

        const description = this.props.tradeLink ?
            'You can create exchange pair by entering the domain name of the issuer' :
            'You can accept an asset by entering the domain name of the issuer.';

        return (
            <div className="island">
                <div className="island__header">{headerTitle}</div>
                <div className="island__paddedContent">
                    <p>{description}</p>
                    <label className="s-inputGroup AddTrust_inputGroup" htmlFor="anchorDomainInput">
                        <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                            <span>Anchor Domain</span>
                        </span>

                        <input
                            className="s-inputGroup__item S-flexItem-share"
                            type="text"
                            name="anchorDomainInput"
                            value={anchorDomain}
                            onChange={e => this.handleInputFederation(e)}
                            placeholder="example: sureremit.co" />
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
