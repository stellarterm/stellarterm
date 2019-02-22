import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';

export default function SendStepDestinationMemoContentInput(props) {
    const { handlers, memoType, memoContent, memoContentLocked } = props.d.send;
    let memoPlaceholder;

    switch (memoType) {
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

    const inputClassName = `s-inputGroup__item S-flexItem-share${memoContentLocked ? ' is-disabled' : ''}`;

    return (
        <label className="s-inputGroup Send__input" htmlFor="memoContentInput">
            <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                <span>Memo content</span>
            </span>

            <input
                value={memoContent}
                className={inputClassName}
                disabled={memoContentLocked}
                placeholder={memoPlaceholder}
                onChange={handlers.updateMemoContent}
                name="memoContentInput"
                type="text" />
        </label>
    );
}

SendStepDestinationMemoContentInput.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
