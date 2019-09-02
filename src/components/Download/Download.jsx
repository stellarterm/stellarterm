import React from 'react';
import images from '../../images';

export default () => (
    <div className="DownloadBack">
        <div className="Desktop_centered">
            <h1 className="desktop_title">Stellarterm For Your Desktop</h1>
            <h2 className="desktop_subtitle">
                Send, receive, and trade assets on the Stellar network easily from any desktop platform
            </h2>
            <div className="os_icons">
                <img className="os_icon" src={images['icon-desktop-linux']} alt="linux" />
                <img className="os_icon" src={images['icon-desktop-windows']} alt="windows" />
                <img className="os_icon" src={images['icon-desktop-mac']} alt="mac-os" />
            </div>
            <a
                href="https://github.com/stellarterm/stellarterm-desktop-client/releases"
                className="s-button download_link"
                target="_blank"
                rel="nofollow noopener noreferrer">
                Download
            </a>
            <img className="desktop_screens" src="/download-screens.png" alt={'Desktop-screens'} />
            <div className="Desktop_description">
                <div className="Description_icon_block">
                    <img src={images['icon-desktop-about']} alt={'icon-about'} />
                </div>
                <div className="description-block">
                    <div className="description-title">About</div>
                    <div className="description-text">
                        StellarTerm is a web app that runs in the browser. Downloading is not required to use
                        StellarTerm. In both the web and desktop version, keys are never sent to any server and
                        transactions are only signed locally. Downloads are for users that prefer a desktop version.
                    </div>
                </div>

                <div className="Description_icon_block">
                    <img src={images['icon-desktop-updates']} alt={'icon-updates'} />
                </div>
                <div className="description-block">
                    <div className="description-title">Updates</div>
                    <div className="description-text">
                        Unlike the web version, downloaded versions do not auto-update (this is preferrable to some
                        people). Also, the web version will receive updates sooner than the desktop versions do. The
                        code to run StellarTerm is self contained in the downloads, though it does not run a Stellar
                        node or run a Stellar API
                    </div>
                </div>
            </div>
        </div>
    </div>
);
