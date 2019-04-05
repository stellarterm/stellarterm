import React from 'react';

export default () => (
    <div className="LoginPage__notes">
        <h3>Security notes</h3>
        <ul>
            <li>Check the url to make sure you are on the correct website.</li>
            <li>
                StellarTerm does not save your secret key. It is stored on your browser and will be deleted once the
                page is refreshed or exited.
            </li>

            <li>
                For extra security, you can{' '}
                <a href="https://github.com/stellarterm/stellarterm" target="_blank" rel="nofollow noopener noreferrer">
                    build from source
                </a>{' '}
                or{' '}
                <a
                    href="https://github.com/stellarterm/stellarterm.github.io/"
                    target="_blank"
                    rel="nofollow noopener noreferrer">
                    download from GitHub
                </a>{' '}
                and verify the hash.
            </li>

            <li>
                StellarTerm is released under the Apache 2.0. It is provided {'"'}AS IS{'"'} without warranty. The
                developer is not responsible for any losses and activities caused by the application.
            </li>
        </ul>
    </div>
);
