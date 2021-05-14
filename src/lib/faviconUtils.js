import createStellarIdenticon from 'stellar-identicon-js';

function setFavicon(favicon = '/favicon.ico') {
    const links = document.getElementsByTagName('link');
    // eslint-disable-next-line no-restricted-syntax
    for (const link of links) {
        if (link.getAttribute('rel').includes('icon')) {
            link.href = favicon;
        }
    }
}

export default function faviconHandler(state, unfundedAccountId, account) {
    switch (state) {
        case 'unfunded': {
            const identiconImg = createStellarIdenticon(unfundedAccountId).toDataURL();
            setFavicon(identiconImg);
            break;
        }
        case 'in': {
            const identiconImg = createStellarIdenticon(account.account_id).toDataURL();
            setFavicon(identiconImg);
            break;
        }
        default: {
            setFavicon();
        }
    }
}
