import React from 'react';
import PropTypes from 'prop-types';
import AutosizeInput from 'react-input-autosize';

export default class FederationInpit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inputValue: this.props.address,
        };
    }

    handleInput({ target }) {
        const { value } = target;
        this.setState({ inputValue: value });
        this.props.onUpdate(value);
    }

    render() {
        const { inputValue } = this.state;

        return (
            <div className="Federation_input">
                <AutosizeInput
                    type="text"
                    name="inputPriceAsset"
                    placeholder="username"
                    maxLength="32"
                    autoFocus
                    value={inputValue}
                    onChange={e => this.handleInput(e)}
                    onFocus={(e) => {
                        const preValue = e.target.value;
                        e.target.value = '';
                        e.target.value = preValue;
                    }}
                    onKeyUp={(e) => {
                        this.props.onKeyPressed(e.keyCode);
                    }} />
            </div>
        );
    }
}

FederationInpit.propTypes = {
    address: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onKeyPressed: PropTypes.func.isRequired,
};
