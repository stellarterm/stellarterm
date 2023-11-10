import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';


const SwapSavings = ({ submit, path }) => (
    <div className="Modal SwapSavings">
        <div className="Modal_header">
            <span>Smart Swap</span>
            <img
                src={images['icon-close']}
                alt="X"
                onClick={() => {
                    submit.cancel();
                }}
            />
        </div>

        <div className="SwapSavings_content">
            <div className="SwapSavings_title">
                    What is smart swap?
            </div>
            <div className="SwapSavings_description">
                    Smart Swap enables programmatic optimization of your swap to find the best routes.
                    A fee of 30% of the extra savings generated is automatically included in this quote
            </div>

            <div className="SwapSavings_path-list">
                <div className="SwapSavings_path-row head">
                    <span>Swap amount (%)</span>
                    <span>Path</span>
                </div>

                {path.extended_paths.map(item =>
                    <div className="SwapSavings_path-row" key={item.readablePath.join()}>
                        <span>{item.percent.toFixed(2)} %</span>

                        <div className="SwapSavings_path">
                            {item.readablePath.map((code, index) => (
                                <React.Fragment key={code}>
                                    <span>{code}</span>
                                    {index !== (item.readablePath.length - 1) && <img src={images['icon-arrow-right']} alt="" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>,
                )}
            </div>

            <button className="s-button" onClick={() => submit.cancel()}>
                I understand
            </button>
        </div>
    </div>
);

export default SwapSavings;

SwapSavings.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    path: PropTypes.shape({
        extended_paths: PropTypes.arrayOf(PropTypes.shape({
            percent: PropTypes.number,
            readablePath: PropTypes.arrayOf(PropTypes.string),
        })),
    }),
};
