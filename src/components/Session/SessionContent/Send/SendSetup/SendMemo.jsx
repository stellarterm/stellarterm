import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import Validate from '../../../../../lib/Validate';
import images from '../../../../../images';

const memoTypes = new Map([
    ['none', 'No memo'],
    ['MEMO_ID', 'Memo ID'],
    ['MEMO_TEXT', 'Memo text'],
    ['MEMO_HASH', 'Memo hash'],
    ['MEMO_RETURN', 'Memo return'],
]);

export default class SendMemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpenList: false,
            selectedType: this.props.d.send.memoType,
        };

        this.handleClickOutside = (e) => {
            if (this.node.contains(e.target)) { return; }
            this.setState({ isOpenList: false });
        };
    }


    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, false);
    }

    onClickMemoDropdown(memoType) {
        const { updateMemoType } = this.props.d.send;

        this.setState({
            isOpenList: !this.state.isOpenList,
            selectedType: memoType || this.state.selectedType,
        });

        if (memoType) {
            updateMemoType(memoType);
        }
    }

    getMemoDropdown() {
        const { isOpenList, selectedType } = this.state;
        const { memoRequired, memoType } = this.props.d.send;

        const onclickDropdownFunc = memoRequired ? null : () => this.onClickMemoDropdown();
        const memoNote = memoRequired ? 'Recipient requires a memo. Please make sure it is correct.' : '';
        const memoDropdownText = isOpenList ? 'Choose memo type' : memoTypes.get(selectedType);

        const arrowClassName = `dropdown_arrow ${isOpenList ? 'arrow_reverse' : ''}`;

        return (
            <React.Fragment>
                <label htmlFor="memoDropdownType">Memo type</label>
                <div className="Send_dropdown">
                    <div className="dropdown_selected" onClick={onclickDropdownFunc}>
                        <span>{memoRequired ? memoTypes.get(memoType) : memoDropdownText}</span>
                        <img
                            src={images.dropdown}
                            alt="▼"
                            className={arrowClassName} />
                    </div>

                    {isOpenList ? (
                        <div className="dropdown_list">
                            <div className="dropdown_item" onClick={() => this.onClickMemoDropdown('none')}>No memo</div>
                            <div className="dropdown_item" onClick={() => this.onClickMemoDropdown('MEMO_ID')}>Memo ID</div>
                            <div className="dropdown_item" onClick={() => this.onClickMemoDropdown('MEMO_TEXT')}>Memo text</div>
                            <div className="dropdown_item" onClick={() => this.onClickMemoDropdown('MEMO_HASH')}>Memo hash</div>
                            <div className="dropdown_item" onClick={() => this.onClickMemoDropdown('MEMO_RETURN')}>Memo return</div>
                        </div>
                    ) : null}
                </div>

                <div className="asset_balance">
                    {memoNote}
                </div>
            </React.Fragment>
        );
    }

    getMemoInput() {
        const { updateMemoContent, memoType, memoContent, memoContentLocked } = this.props.d.send;
        let memoPlaceholder;

        switch (memoType) {
        case 'none':
            memoPlaceholder = 'No memo';
            break;
        case 'MEMO_ID':
            memoPlaceholder = 'Memo ID number';
            break;
        case 'MEMO_TEXT':
            memoPlaceholder = 'Up to 28 bytes of text';
            break;
        case 'MEMO_HASH':
            memoPlaceholder = '64 character hexadecimal encoded string';
            break;
        case 'MEMO_RETURN':
            memoPlaceholder = '64 character hexadecimal encoded string';
            break;
        default:
            break;
        }
        const isMemoDisabled = memoType === 'none';

        return (
            <React.Fragment>
                <label htmlFor="memo">Memo message</label>
                <input
                    name="memo"
                    type="text"
                    value={memoContent}
                    disabled={memoContentLocked || isMemoDisabled}
                    onChange={updateMemoContent}
                    placeholder={memoPlaceholder} />
            </React.Fragment>
        );
    }

    render() {
        const { d } = this.props;
        const { memoRequired, memoType, memoContent } = d.send;

        let memoValidationMessage;

        if (memoType !== 'none') {
            const memoV = Validate.memo(memoContent, memoType);
            memoValidationMessage = memoV.message ? memoV.message : null;
        }

        const memoInputClass = `Send_input_block ${memoType === 'none' ? 'disabled_block' : ''}`;
        const memoDropdownClass = `Send_dropdown_block ${memoRequired ? 'disabled_block' : ''}`;

        return (
            <div className="Input_flexed_block">
                <div className={memoInputClass}>
                    {memoValidationMessage ? <div className="invalidValue_popup">Memo is not valid</div> : null}
                    {this.getMemoInput()}

                    <div className="field_description">
                        {memoValidationMessage}
                    </div>
                </div>

                <div
                    className={memoDropdownClass}
                    ref={(node) => { this.node = node; }} >
                    {this.getMemoDropdown()}
                </div>
            </div>
        );
    }
}

SendMemo.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
