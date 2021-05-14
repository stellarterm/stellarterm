import createStellarIdenticon from 'stellar-identicon-js';

function changeFaviconToIdenticon(accountId) {
    const identiconImg = createStellarIdenticon(accountId).toDataURL();

    const links = document.getElementsByTagName('link');

    if (!links) {
        return;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const link of links) {
        if (link.getAttribute('rel').includes('icon')) {
            link.href = identiconImg;
        }
    }
}

function setDefaultFavicon() {
    const links = document.getElementsByTagName('link');
    // eslint-disable-next-line no-restricted-syntax
    for (const link of links) {
        if (link.getAttribute('rel').includes('icon')) {
            link.href = '/favicon.ico';
        }
    }
}

export default function faviconHandler(state, unfundedAccountId, account) {
    switch (state) {
        case 'unfunded': {
            changeFaviconToIdenticon(unfundedAccountId);
            break;
        }
        case 'in': {
            const { account_id: accountId } = account;
            changeFaviconToIdenticon(accountId);
            break;
        }
        default: {
            setDefaultFavicon();
        }
    }
}
