import React from 'react';
import images from '../../../../images';

export default () => (
    <div className="InfoBlockWithHoverDescription">
        <img src={images['icon-info-gray']} alt="i" />
        <div className="InfoBlockWithHoverDescription-popup">
            For extra security, you can {' '}
            <a
                href="https://github.com/stellarterm/stellarterm"
                target="_blank"
                rel="nofollow noopener noreferrer">
                build from source
            </a>
            {' '}or{' '}
            <a
                href="https://github.com/stellarterm/stellarterm-desktop-client/releases"
                target="_blank"
                rel="nofollow noopener noreferrer">
                download from GitHub
            </a>
            {' '}and verify the hash.
            <br />
            <br />
            StellarTerm is released under the Apache 2.0. It is provided &quot;AS IS&quot; without
            warranty. The developer is not responsible for any losses and activities caused
            by the application.
        </div>
    </div>
);
