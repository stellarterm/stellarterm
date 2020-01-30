import React from 'react';
import * as StellarSdk from 'stellar-sdk';
import AcceptTerms from '../Common/AcceptTerms';
import clickToSelect from '../../../../lib/clickToSelect';
import SignUpDescription from './SignUpDescription/SignUpDescription';
import SignUpSecurityNotes from './SignUpSecurityNotes/SignUpSecurityNotes';

export default class SignUpBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newKeypair: null,
        };
    }

    handleGenerate() {
        const keypair = StellarSdk.Keypair.random();
        this.setState({
            newKeypair: {
                pubKey: keypair.publicKey(),
                secretKey: keypair.secret(),
            },
        });
    }

    renderNewAccoutDetails() {
        return (
            <div className="LoginPage__generatedNote">
                <p>
                    <strong>
                        Keep your key secure. This secret key will only be showed to you once. StellarTerm does not save
                        it and will not be able to help you recover it if lost.
                    </strong>
                </p>
                <p>
                    Public key (will be your Account ID): <br /> {this.state.newKeypair.pubKey}
                </p>
                <p>
                    Secret key (<strong>SAVE THIS AND KEEP THIS SECURE</strong>):{' '}
                    <span className="clickToSelect" onClick={clickToSelect}>
                        {this.state.newKeypair.secretKey}
                    </span>
                </p>
            </div>
        );
    }

    render() {
        let newKeyPairDetails;

        if (this.state.newKeypair !== null) {
            newKeyPairDetails = this.renderNewAccoutDetails();
        }

        return (
            <div className="LoginPage__body">
                <div className="LoginPage__greenBox">
                    <div className="LoginPage__form">
                        <SignUpDescription />
                        <AcceptTerms funcOnSubmit={() => this.handleGenerate()} loginButtonText={'Generate keypair'} />
                        {newKeyPairDetails}
                    </div>
                    <SignUpSecurityNotes />
                </div>
            </div>
        );
    }
}
