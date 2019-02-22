import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';

export default function SendStepDestinatinationMemoDropdown(props) {
    const { memoType, memoRequired, handlers } = props.d.send;

    const dropdownClassName = `so-dropdown s-inputGroup__item S-flexItem-noFlex${memoRequired ? ' is-disabled' : ''}`;
    const memoNote = memoRequired ? 'Recipient requires a memo. Please make sure it is correct.' : '';

    return (
        <label className="s-inputGroup Send__input" htmlFor="inputSelectMemoType">
            <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                <span>Memo type</span>
            </span>

            <span className={dropdownClassName}>
                <select
                    value={memoType}
                    onChange={handlers.updateMemoType}
                    disabled={memoRequired}
                    name="inputSelectMemoType"
                    className="so-dropdown__select">
                    <option>none</option>
                    <option>MEMO_ID</option>
                    <option>MEMO_TEXT</option>
                    <option>MEMO_HASH</option>
                    <option>MEMO_RETURN</option>
                </select>
            </span>

            <span className="s-inputGroup__item s-inputGroup__item--tagMin S-flexItem-share">
                <span className="Send__memoNotice">{memoNote}</span>
            </span>
        </label>
    );
}

SendStepDestinatinationMemoDropdown.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
