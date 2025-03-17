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
                What Are Smart Swaps?
            </div>
            <div className="SwapSavings_description">
                Smart Swaps use advanced routing engines to help you achieve better exchange rates.
                 Our platform offers several Smart Swap engines—such as Stellar Classic,
                 StellarTerm, and Stellar Broker. These engines work by splitting your trades into smaller
                 parts or analyzing multiple liquidity sources,
                 thereby finding potentially better routes for your swaps.
                <br />
                Some Smart Swap engines charge a fee only on the extra savings generated, ensuring you only pay
                 when you benefit from improved rates. You can explore and adjust these options in your settings to
                 find the balance that works best for you.
            </div>

            {!!path.extended_paths.length && <div className="SwapSavings_path-list">
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
            </div>}

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
