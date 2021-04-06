import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

const INITIAL_STATE = {
    isOpenList: false,
    searchValue: '',
};

export default class CurrencyDropdown extends React.Component {
    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;

        this.handleClickOutside = e => {
            if (this.node.contains(e.target)) {
                return;
            }
            this.setState({ isOpenList: false });
        };
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, false);
    }

    onClickAssetDropdown(token) {
        this.setState({
            isOpenList: !this.state.isOpenList,
        });
        if (token) {
            this.props.changeFunc(token);
        }
    }

    handleSearch(value) {
        this.setState({
            searchValue: value,
        });
    }

    clickSearchCloseBtn() {
        this.setState(INITIAL_STATE);
    }

    renderSearchField() {
        return (
            <div className="search_field">
                <img className="search_icon" src={images['icon-search']} alt="search" />

                <input
                    name="currencyInput"
                    type="text"
                    autoFocus
                    autoComplete="off"
                    className="Moonpay_input search_input"
                    value={this.state.searchValue}
                    maxLength={30}
                    onChange={e => this.handleSearch(e.target.value)}
                    placeholder="Type currency name or ticker"
                />
                <img
                    className="close_button"
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => this.clickSearchCloseBtn()}
                />
            </div>
        );
    }

    renderTokenWithIcon(token) {
        const isSelectedToken = this.props.selectedToken.code === token.code;
        return (
            <div
                className={`dropdown_item ${isSelectedToken ? 'dropdown_selected_item' : ''}`}
                key={token.id}
                onClick={() => this.onClickAssetDropdown(token)}
            >
                <div className="token_block_wrapper">
                    <img className="currency_icon" src={token.icon} alt={token.name} />
                    <div className="name_wrapper">
                        <span className="code_small">{token.code}</span>
                        <span className="name_small">{token.name}</span>
                    </div>
                    {isSelectedToken && (
                        <img className="selected_crypto_check" src={images['icon-tick-small']} alt="" />
                    )}
                </div>
            </div>
        );
    }

    render() {
        const { popularCurrencies, nonPopularCurrencies, selectedToken } = this.props;
        const { isOpenList, searchValue } = this.state;

        const filterTokens = tokens =>
            tokens.filter(
                currency =>
                    currency.code.toLowerCase().includes(searchValue.toLowerCase()) ||
                    currency.name.toLowerCase().includes(searchValue.toLowerCase()),
            );

        const filteredPopularTokens = filterTokens(popularCurrencies);
        const filteredNonPopularTokens = filterTokens(nonPopularCurrencies);

        const tokensList = (
            <div className="dropdown_list">
                {filteredPopularTokens.length || filteredNonPopularTokens.length ? (
                    <React.Fragment>
                        {filteredPopularTokens.length ? (
                            <React.Fragment>
                                <div className="popular_separator">Popular currencies</div>
                                {filteredPopularTokens.map(token => this.renderTokenWithIcon(token))}
                            </React.Fragment>
                        ) : null}
                        {filteredNonPopularTokens.length ? (
                            <React.Fragment>
                                <div className="popular_separator">All currencies</div>
                                {filteredNonPopularTokens.map(token => this.renderTokenWithIcon(token))}
                            </React.Fragment>
                        ) : null}
                    </React.Fragment>
                ) : (
                    <div className="dropdown_item not_found">
                        Nothing found for {'"'}
                        {searchValue}
                        {'"'}
                    </div>
                )}
            </div>
        );

        const arrowClassName = `dropdown_arrow ${isOpenList ? 'arrow_reverse' : ''}`;

        return (
            <div
                className="Currency_dropdown"
                ref={node => {
                    this.node = node;
                }}
            >
                <div className="dropdown_selected" onClick={() => this.onClickAssetDropdown()}>
                    <div className="token_block_wrapper">
                        <img className="currency_icon" src={selectedToken.icon} alt={selectedToken.name} />
                        <div className="name_wrapper">
                            <span className="code_small">{selectedToken.code}</span>
                            <span className="name_small">{selectedToken.name}</span>
                        </div>
                    </div>
                    <img src={images.dropdown} alt="▼" className={arrowClassName} />
                </div>

                {isOpenList ? (
                    <React.Fragment>
                        {this.renderSearchField()}
                        {tokensList}
                    </React.Fragment>
                ) : null}
            </div>
        );
    }
}

CurrencyDropdown.propTypes = {
    selectedToken: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])),
    popularCurrencies: PropTypes.arrayOf(
        PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])),
    ),
    nonPopularCurrencies: PropTypes.arrayOf(
        PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])),
    ),
    changeFunc: PropTypes.func.isRequired,
};
