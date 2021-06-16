import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import { HORIZON_SERVER_EVENTS } from '../../../../../lib/HorizonServer';
import { CODE_ENTER } from '../../SessionAccount/Federation/Federation';

const PreferredHorizon = ({ d }) => {
    const [customUrl, setCustomUrl] = useState('');
    const [serverList, setServerList] = useState(d.horizonServer.serverList);
    const [activeServer, setActiveServer] = useState(d.horizonServer.activeServer);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = d.horizonServer.event.sub(event => {
            if (event === HORIZON_SERVER_EVENTS.newHorizonAdded) {
                setServerList(d.horizonServer.serverList);
            }
            if (event === HORIZON_SERVER_EVENTS.horizonChanged) {
                setActiveServer(d.horizonServer.activeServer);
            }
        });

        return () => unsubscribe();
    }, []);

    const addCustomServer = () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        d.horizonServer.addCustomServer(customUrl)
            .then(() => {
                setCustomUrl('');
                d.toastService.success('Success', 'Custom horizon added');
                setIsLoading(false);
            })
            .catch(e => {
                d.toastService.error('Can not add horizon', e.message);
                setIsLoading(false);
            });
    };

    const onKeyPress = ({ keyCode }) => {
        if (keyCode === CODE_ENTER) {
            addCustomServer();
        }
    };

    const changeHorizon = url => {
        d.horizonServer.changeHorizon(url);
    };

    return (
        <div>
            <div className="island">
                <div className="island__header">Preferred horizon</div>
                <div className="PreferredHorizon_container">
                    {serverList.map(server => (
                        <div
                            className={`PreferredHorizon_card ${server.url === activeServer ? 'active' : ''}`}
                            onClick={() => changeHorizon(server.url)}
                        >
                            {server.name && <span>{server.name}</span>}
                            <span>{server.url}</span>
                            <span className="PreferredHorizon_card-radio" />
                        </div>
                    ))}

                    <div className="PreferredHorizon_card">
                        <span className="PreferredHorizon_card-title">Custom horizon</span>
                        <div className="PreferredHorizon_card-form">
                            <input
                                value={customUrl}
                                onChange={e => setCustomUrl(e.target.value)}
                                onKeyUp={onKeyPress}
                                className="PreferredHorizon_input"
                                placeholder="Enter custom horizon url"
                            />
                            <button
                                className="s-button"
                                disabled={!customUrl || isLoading}
                                onClick={() => addCustomServer()}
                            >
                                ADD
                                {isLoading && <div className="nk-spinner" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

PreferredHorizon.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

export default PreferredHorizon;
