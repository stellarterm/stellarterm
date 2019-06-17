// TODO: Refactor and improve this component
import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import Validate from '../../../../lib/Validate';
import Generic from '../../../Common/Generic/Generic';

export default class Inflation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            status: 'ready', // 'ready' | 'working'
            stellarTermVote: 'ready', // 'ready' | 'working'
            inflationDest: '',
            result: '', // '' | 'success' | 'error'
        };

        this.handleInput = (event) => {
            this.setState({
                inflationDest: event.target.value,
            });
        };

        this.handleSubmit = async () => {
            this.props.d.session.handlers.setInflation(this.state.inflationDest).then((bssResult) => {
                if (bssResult.status === 'finish') {
                    this.setState({
                        status: 'working',
                        result: '',
                    });

                    return bssResult.serverResult
                        .then(() => {
                            this.setState({
                                status: 'ready',
                                result: 'success',
                            });
                            this.props.d.session.account.refresh();
                            setTimeout(() => {
                                this.forceUpdate();
                            }, 1000);
                        })
                        .catch((error) => {
                            console.error(error);
                            this.setState({
                                status: 'ready',
                                result: 'error',
                            });
                        });
                }
                return null;
            });
        };

        this.handleStellarTermVote = async () => {
            this.props.d.session.handlers
                .setInflation('GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW')
                .then((bssResult) => {
                    if (bssResult.status === 'finish') {
                        this.setState({
                            stellarTermVote: 'working',
                        });

                        return bssResult.serverResult
                            .then(() => {
                                this.props.d.session.account.refresh();
                                setTimeout(() => {
                                    this.forceUpdate();
                                }, 1000);
                            })
                            .catch((error) => {
                                console.error(error);
                                this.setState({
                                    stellarTermVote: 'working',
                                });
                            });
                    }
                    return null;
                });
        };
    }

    render() {
        const d = this.props.d;
        const account = d.session.account;

        let inflationDestInfo;
        if (account.inflation_destination === undefined) {
            inflationDestInfo = (
                <div>
                    <p>
                        You are currently <strong>not</strong> voting for any inflation destination.
                    </p>
                </div>
            );
        } else if (account.inflation_destination === 'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW') {
            inflationDestInfo = (
                <div>
                    <p>
                        You are currently voting for: <strong>{account.inflation_destination}</strong> (StellarTerm)
                    </p>
                    <div className="Generic__divider" />
                    <h3 className="Inflation__thankYou">Thank you for voting for StellarTerm!</h3>
                </div>
            );
        } else {
            let stButton = (
                <button
                    className="s-button Inflation__stellarTermVote"
                    onClick={(e) => {
                        this.handleStellarTermVote(e);
                    }}>
                    Vote for StellarTerm
                </button>
            );
            if (this.state.stellarTermVote === 'working') {
                stButton = (
                    <button
                        disabled
                        className="s-button Inflation__stellarTermVote"
                        onClick={(e) => {
                            this.handleStellarTermVote(e);
                        }}>
                        Voting... Thank you!
                    </button>
                );
            }

            inflationDestInfo = (
                <div>
                    <p>
                        You are currently voting for: <strong>{account.inflation_destination}</strong>
                    </p>
                    <div className="Generic__divider" />
                    {stButton}
                </div>
            );
        }

        const validAddress = Validate.publicKey(this.state.inflationDest).ready;

        let submitButton;
        if (this.state.status === 'working') {
            submitButton = (
                <button disabled className="s-button">
                    Setting inflation destination...
                </button>
            );
        } else if (validAddress) {
            submitButton = (
                <button
                    className="s-button"
                    onClick={(e) => {
                        this.handleSubmit(e);
                    }}>
                    Set inflation destination
                </button>
            );
        } else {
            submitButton = (
                <button disabled className="s-button">
                    Set inflation destination
                </button>
            );
        }

        let result;
        if (this.state.result === 'success') {
            result = (
                <div className="s-alert s-alert--success Inflation__alert">Inflation destination successfully set!</div>
            );
        } else if (this.state.result === 'error') {
            result = (
                <div className="s-alert s-alert--alert Inflation__alert">
                    Error occurred while setting inflation destination!
                </div>
            );
        }

        return (
            <div className="Inflation">
                <Generic title="Set your inflation destination">
                    {inflationDestInfo}

                    <div className="Generic__divider" />

                    <label className="s-inputGroup Inflation__inputGroup" htmlFor="inputInflationDest">
                        <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                            <span>Inflation destination</span>
                        </span>

                        <input
                            className="s-inputGroup__item S-flexItem-share"
                            name="inputInflationDest"
                            type="text"
                            value={this.state.inflationDest}
                            onChange={this.handleInput}
                            placeholder="example: GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT" />
                    </label>

                    {submitButton}
                    {result}
                </Generic>
            </div>
        );
    }
}

Inflation.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
