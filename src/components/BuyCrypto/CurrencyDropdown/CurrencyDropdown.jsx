import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

export default class CurrencyDropdown extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpenList: false,
        };

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

    render() {
        const { currencies, selectedToken } = this.props;
        const { isOpenList } = this.state;

        const tokenWithIcon = token => (
            <div className="token_block_wrapper full_Width">
                <img className="currency_icon" src={token.icon} alt={token.name} />
                <div className="name_wrapper">
                    <span className="code_small">{token.code}</span>
                    <span className="name_small">{token.name}</span>
                </div>
                {selectedToken.code === token.code && (
                    <img className="selected_crypto_check" src={images['icon-tick-small']} alt="" />
                )}
            </div>
        );

        const tokensList = currencies.map(token => (
            <div className="dropdown_item" key={token.id} onClick={() => this.onClickAssetDropdown(token)}>
                {tokenWithIcon(token)}
            </div>
        ));

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

                {isOpenList ? <div className="dropdown_list">{tokensList}</div> : null}
            </div>
        );
    }
}

CurrencyDropdown.propTypes = {
    selectedToken: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])),
    currencies: PropTypes.arrayOf(
        PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])),
    ),
    changeFunc: PropTypes.func.isRequired,
};
