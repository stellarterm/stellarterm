const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const { transformFileSync } = require('@babel/core');
const sdk = require('@stellar/stellar-sdk');
const fixtures = require('./fixtures/stellar-results.json');

// Transpile application modules with the existing Babel plugin. Browser and network
// boundaries are mocked explicitly; transaction encoding and signing use the real SDK.
function loadSource(relativePath, mocks = {}) {
    const filename = path.resolve(__dirname, '..', relativePath);
    const localRequire = createRequire(filename);
    const { code } = transformFileSync(filename, {
        babelrc: false,
        configFile: false,
        plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
    });
    const module = { exports: {} };
    const requireSource = id => {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        if (id.startsWith('.')) {
            return loadSource(path.relative(path.resolve(__dirname, '..'), localRequire.resolve(id)), mocks);
        }
        return localRequire(id);
    };
    new Function('require', 'module', 'exports', code)(requireSource, module, module.exports);
    return module.exports;
}

const signer = sdk.Keypair.fromRawEd25519Seed(new Uint8Array(32).fill(1));
const recipient = sdk.Keypair.fromRawEd25519Seed(new Uint8Array(32).fill(2));
const networkMocks = {
    '../../api/endpoints': {},
    '../../api/request': {},
    '../../../env-consts': {},
    '../../constants/multisigConstants': {},
    './Session': {},
};
const { default: Swap } = loadSource('src/lib/driver/driverInstances/Swap.js', networkMocks);
const { default: Multisig } = loadSource('src/lib/driver/driverInstances/Multisig.js', networkMocks);
const { default: Validate } = loadSource('src/lib/helpers/Validate.js');
const { default: Stellarify } = loadSource('src/lib/helpers/Stellarify.js');

function transaction(networkPassphrase = sdk.Networks.TESTNET, memo = sdk.Memo.none()) {
    return new sdk.TransactionBuilder(new sdk.Account(signer.publicKey(), '123'), {
        fee: '100', networkPassphrase,
    }).addOperation(sdk.Operation.payment({
        destination: recipient.publicKey(), asset: sdk.Asset.native(), amount: '1',
    })).addMemo(memo).setTimeout(0).build();
}

async function walletAccount(mocks = {}, bip32Path = "m/44'/148'/0'") {
    const { default: MagicSpoon } = loadSource('src/lib/helpers/MagicSpoon.js', {
        '@trezor/connect-web': { init: async () => {}, ...mocks['@trezor/connect-web'] },
        '@ledgerhq/hw-transport-webusb': {},
        '@stellar/varial-sdk': {},
        '@lobstrco/signer-extension-api': {},
        ...mocks,
        './Trezor': loadSource('src/lib/helpers/Trezor.js', {
            '@trezor/connect-web': { init: async () => {}, ...mocks['@trezor/connect-web'] },
        }),
    });
    const builder = {
        accountId() { return this; },
        forAccount() { return this; },
        limit() { return this; },
        order() { return this; },
        stream() { return () => {}; },
        async call() { return { records: [] }; },
    };
    const server = {
        networkPassphrase: sdk.Networks.TESTNET,
        loadAccount: async () => new sdk.Account(signer.publicKey(), '123'),
        accounts: () => builder,
        offers: () => builder,
    };
    return MagicSpoon.Account(server, signer, { bip32Path }, () => {});
}

function assertSigned(tx, keypair = signer) {
    const decoded = sdk.TransactionBuilder.fromXdr(tx.toXdr(), tx.networkPassphrase);
    assert.equal(decoded.signatures.length, 1);
    assert(keypair.verify(decoded.hash(), decoded.signatures[0].signature));
    assert.deepEqual(decoded.signatures[0].hint.toBytes(), keypair.signatureHint());
}

test('memo ID validation preserves uint64 boundaries without the removed UnsignedHyper API', () => {
    for (const value of ['0', '1', '18446744073709551615']) {
        assert.equal(Validate.memo(value, 'MEMO_ID').ready, true, value);
        assert.doesNotThrow(() => sdk.Memo.id(value));
    }
    for (const value of ['', '-1', '1.5', '01', '1e2', '18446744073709551616', '9'.repeat(100)]) {
        assert.equal(Validate.memo(value, 'MEMO_ID').ready, false, value);
    }
});

test('decoded UTF-8, ID and hash memos display their original values', () => {
    const hash = 'ab'.repeat(32);
    const cases = [
        [sdk.Memo.none(), ''],
        [sdk.Memo.text('Привет Stellar'), 'Привет Stellar'],
        [sdk.Memo.id('18446744073709551615'), '18446744073709551615'],
        [sdk.Memo.hash(hash), hash],
        [Stellarify.memo('MEMO_RETURN', hash), hash],
    ];
    for (const [memo, expected] of cases) {
        const decoded = sdk.TransactionBuilder.fromXdr(transaction(sdk.Networks.TESTNET, memo).toXdr(), sdk.Networks.TESTNET);
        assert.equal(Stellarify.memoToString(decoded.memo), expected);
    }
});

test('legacy signed XDR remains valid and keeps its text memo', () => {
    const tx = sdk.TransactionBuilder.fromXdr(fixtures.signedPayment, sdk.Networks.TESTNET);
    assert.equal(tx.toXdr(), fixtures.signedPayment);
    assert.equal(Stellarify.memoToString(tx.memo), 'Привет Stellar');
    assertSigned(tx);
});

test('Vault signature weights count each valid signer once', () => {
    const multisig = new Multisig({ session: { account: { signers: [
        { key: signer.publicKey(), weight: 10 },
        { key: recipient.publicKey(), weight: 20 },
    ] } } });
    const tx = sdk.TransactionBuilder.fromXdr(fixtures.signedPayment, sdk.Networks.TESTNET);
    assert.equal(multisig.getSignaturesWeight(tx.toXdr(), sdk.Networks.TESTNET), 10);
    tx.sign(recipient);
    tx.sign(signer);
    assert.equal(multisig.getSignaturesWeight(tx.toXdr(), sdk.Networks.TESTNET), 30);
    assert.equal(multisig.getSignaturesWeight(tx.toXdr(), sdk.Networks.PUBLIC), 0);
});

test('strict-send swaps aggregate destination amounts across offers and pools', () => {
    assert.equal(Swap.getSwapAmount({ result_xdr: fixtures.strictSend }, true), '20.0000000');
});

test('strict-receive swaps include the fee transfer but exclude other transfers', () => {
    assert.equal(Swap.getSwapAmount({ result_xdr: fixtures.strictReceiveWithFee }, false), '30.0500000');
});

test('swap amounts retain stroop precision beyond Number.MAX_SAFE_INTEGER', () => {
    assert.equal(Swap.getSwapAmount({ result_xdr: fixtures.largeNativeAmount }, true), '900719925.4740993');
});

test('result asset names decode native, short and long asset codes', () => {
    for (const code of ['USD', 'LONGASSET123']) {
        const asset = new sdk.Asset(code, recipient.publicKey());
        assert.equal(Swap.getResultXdrAssetString(asset.toXdrObject()), `${code}:${recipient.publicKey()}`);
    }
    assert.equal(Swap.getResultXdrAssetString(sdk.Asset.native().toXdrObject()), 'native');
});

test('Trezor signs XDR for public network and testnet without the deprecated adapter', async () => {
    let params;
    const account = await walletAccount({ '@trezor/connect-web': {
        stellarSignTransaction: async request => {
            params = request;
            const network = request.testnet ? sdk.Networks.TESTNET : sdk.Networks.PUBLIC;
            const tx = sdk.TransactionBuilder.fromXdr(request.xdrBase64, network);
            return { success: true, payload: { signature: sdk.xdr.encodeBytes(signer.sign(tx.hash()), 'hex') } };
        },
    } });
    for (const network of [sdk.Networks.PUBLIC, sdk.Networks.TESTNET]) {
        const tx = transaction(network, sdk.Memo.hash('ab'.repeat(32)));
        const unsigned = tx.toXdr();
        await account.signWithTrezor(tx);
        assert.deepEqual(params, { path: "m/44'/148'/0'", xdrBase64: unsigned, testnet: network === sdk.Networks.TESTNET });
        assertSigned(tx);
    }
});

test('Trezor rejects unsupported networks before opening the wallet', async () => {
    const account = await walletAccount({ '@trezor/connect-web': {
        stellarSignTransaction: () => assert.fail('Must not sign with a different network passphrase'),
    } });
    await assert.rejects(account.signWithTrezor(transaction('Custom network')), /public network and testnet/);
});

test('Trezor cancellation leaves the transaction unsigned', async () => {
    const error = { code: 'Method_Cancel', message: 'Cancelled by user' };
    const account = await walletAccount({ '@trezor/connect-web': {
        stellarSignTransaction: async () => ({ success: false, error }),
    } });
    const tx = transaction();
    await assert.rejects(account.signWithTrezor(tx), /Cancelled by user/);
    assert.equal(tx.signatures.length, 0);
});

test('Trezor initialization includes the v10 manifest, shares requests and retries failures', async () => {
    let calls = 0;
    let fail = true;
    const { default: initialize } = loadSource('src/lib/helpers/Trezor.js', { '@trezor/connect-web': {
        init: async ({ manifest }) => {
            calls++;
            assert.equal(manifest.appName, 'StellarTerm');
            assert.equal(manifest.appUrl, 'https://stellarterm.com');
            assert.equal(manifest.email, 'support@stellarterm.com');
            if (fail) throw new Error('Connection unavailable');
        },
    } });
    const first = initialize();
    assert.equal(initialize(), first);
    await assert.rejects(first, /Connection unavailable/);
    fail = false;
    await initialize();
    await initialize();
    assert.equal(calls, 2);
});

test('Trezor login awaits initialization and reports Connect v10 errors', async () => {
    let initialized = false;
    let result = { success: true, payload: { address: signer.publicKey() } };
    const { default: Session } = loadSource('src/lib/driver/driverInstances/Session.js', {
        ...networkMocks,
        'stellarterm-directory': { initializeIssuerOrgs: () => new Promise(() => {}) },
        '../../helpers/MagicSpoon': {},
        '../../helpers/Trezor': async () => { initialized = true; },
        '@trezor/connect-web': { stellarGetAddress: async params => {
            assert(initialized);
            assert.deepEqual(params, { path: "m/44'/148'/0'", showOnTrezor: false });
            return result;
        } },
    });
    const session = new Session({});
    session.handlers.logIn = async (keypair, options) => {
        assert.equal(keypair.publicKey(), signer.publicKey());
        assert.equal(options.authType, 'trezor');
        return 'logged';
    };
    assert.equal(await session.handlers.logInWithTrezor("m/44'/148'/0'"), 'logged');
    result = { success: false, error: { code: 'Method_Cancel', message: 'Cancelled by user' } };
    await assert.rejects(session.handlers.logInWithTrezor("m/44'/148'/0'"), /Cancelled by user/);
});

test('Ledger uses the installed app library and signs the complete signature base', async () => {
    const chunks = [];
    const transport = {
        decorateAppAPIMethods() {},
        async send(cla, instruction, p1, p2, chunk) {
            assert.equal(cla, 0xe0);
            assert.equal(instruction, 0x04);
            assert(Buffer.isBuffer(chunk));
            chunks.push(chunk);
            if (p2 !== 0) return Buffer.from([0x90, 0x00]);
            const payload = Buffer.concat(chunks);
            const pathLength = 1 + payload[0] * 4;
            const signatureBase = payload.subarray(pathLength);
            return Buffer.concat([Buffer.from(signer.sign(sdk.hash(signatureBase))), Buffer.from([0x90, 0x00])]);
        },
    };
    const account = await walletAccount({ '@ledgerhq/hw-transport-webusb': { create: async () => transport } }, "44'/148'/0'");
    const tx = transaction();
    await account.signWithLedger(tx);
    assertSigned(tx);
});

test('LOBSTR signed XDR and local signatures round-trip with the new SDK', async () => {
    const account = await walletAccount({ '@lobstrco/signer-extension-api': {
        signTransaction: async xdr => {
            const tx = sdk.TransactionBuilder.fromXdr(xdr, sdk.Networks.TESTNET);
            tx.sign(signer);
            return tx.toXdr();
        },
    } });
    assertSigned(await account.signWithLobstrExtension(transaction()));
    const local = transaction();
    account.signWithSecret(local);
    assertSigned(local);
    const payload = sdk.hash(new Uint8Array([1, 2, 3]));
    assert(signer.verify(payload, account.signAuthWithSecret(payload)));
});

test('WalletConnect restores a Stellar session and requests a verifiable signature', async () => {
    let request;
    let login;
    const session = {
        topic: 'test-session',
        namespaces: { stellar: {
            accounts: [`stellar:pubnet:${signer.publicKey()}`],
            methods: ['stellar_signXDR', 'stellar_signAndSubmitXDR'],
        } },
        peer: { metadata: { name: 'Test wallet', icons: [] } },
    };
    const client = {
        session: { length: 1, getAll: () => [session] },
        on() {},
        request: async options => {
            request = options;
            const tx = sdk.TransactionBuilder.fromXdr(options.request.params.xdr, sdk.Networks.PUBLIC);
            tx.sign(signer);
            return { signedXDR: tx.toXdr() };
        },
    };
    const actualWalletConnect = require('@walletconnect/sign-client');
    const { default: WalletConnectService } = loadSource('src/lib/driver/driverInstances/WalletConnectService.js', {
        '@walletconnect/sign-client': {
            __esModule: true,
            default: { init: async () => client },
            SIGN_CLIENT_EVENTS: actualWalletConnect.SIGN_CLIENT_EVENTS,
        },
        '../../../components/HomePage/Sep7Handler/Sep7Handler': {},
        '../../../env-consts': { WALLET_CONNECT_PROJECT_ID: 'test-project' },
    });
    const driver = {
        isOnline: true,
        session: { handlers: { logIn: async (keypair, options) => { login = { keypair, options }; } } },
        modal: { handlers: { activate(name, data) { assert.equal(name, 'WalletConnectRequestModal'); return data.result; } } },
    };
    const service = new WalletConnectService(driver);
    assert.equal(await service.initWalletConnect(), 'logged');
    assert.equal(login.keypair.publicKey(), signer.publicKey());
    assert.equal(login.options.authType, 'wallet-connect');
    const signed = await service.signTx(transaction(sdk.Networks.PUBLIC));
    assert.equal(request.topic, session.topic);
    assert.equal(request.chainId, 'stellar:pubnet');
    assert.equal(request.request.method, 'stellar_signXDR');
    assertSigned(sdk.TransactionBuilder.fromXdr(signed, sdk.Networks.PUBLIC));
});

test('WalletConnect checks approved optional namespaces before logging in', async () => {
    const { default: WalletConnectService } = loadSource('src/lib/driver/driverInstances/WalletConnectService.js', {
        '../../../components/HomePage/Sep7Handler/Sep7Handler': {},
        '../../../env-consts': {},
    });
    const methods = ['stellar_signXDR', 'stellar_signAndSubmitXDR'];
    const namespace = { accounts: [`stellar:pubnet:${signer.publicKey()}`], methods };
    assert.equal(WalletConnectService.getPublicKey({ namespaces: { 'stellar:pubnet': namespace } }), signer.publicKey());
    assert.equal(WalletConnectService.getPublicKey({ namespaces: {} }), null);
    assert.equal(WalletConnectService.getPublicKey({ namespaces: { stellar: { ...namespace, methods: [] } } }), null);
    const unsupported = { topic: 'testnet-session', namespaces: { stellar: {
        accounts: [`stellar:testnet:${signer.publicKey()}`], methods,
    } } };
    assert.equal(WalletConnectService.getPublicKey(unsupported), null);
    let disconnected;
    let error;
    const service = new WalletConnectService({
        isOnline: true,
        session: { handlers: { logIn: () => assert.fail('An unsupported wallet must not log in') } },
        modal: { handlers: { activate() {}, cancel() {} } },
        toastService: { error(title, message) { error = message; } },
    });
    service.client = {
        connect: async options => {
            assert.deepEqual(options.optionalNamespaces.stellar.methods, methods.slice().reverse());
            assert.equal(options.requiredNamespaces, undefined);
            return { uri: 'wc:test', approval: async () => unsupported };
        },
        disconnect: async ({ topic }) => { disconnected = topic; },
    };
    await service.connect();
    assert.equal(disconnected, unsupported.topic);
    assert.match(error, /Stellar public network/);
    assert.equal(service.session, null);
});

test('WalletConnect logout handles a session_delete event during disconnect', async () => {
    const { default: WalletConnectService } = loadSource('src/lib/driver/driverInstances/WalletConnectService.js', {
        '../../../components/HomePage/Sep7Handler/Sep7Handler': {},
        '../../../env-consts': {},
    });
    let logouts = 0;
    const service = new WalletConnectService({ session: { handlers: { handleLogout: () => { logouts++; } } } });
    service.session = { topic: 'test-session' };
    service.client = { disconnect: async ({ topic }) => service.onSessionDeleted(topic) };
    await service.logout();
    assert.equal(service.session, null);
    assert.equal(logouts, 1);
});

for (const credentialType of ['sorobanCredentialsAddress', 'sorobanCredentialsAddressV2']) {
    test(`Stellar Broker serializes valid ${credentialType} authorization`, async () => {
        const { StellarBrokerClient } = require('@stellar-broker/client');
        const account = await walletAccount();
        const client = new StellarBrokerClient({
            partnerKey: 'test-partner', account: signer.publicKey(), network: sdk.Networks.TESTNET,
            authorization: async payload => {
                if (!payload.sign) return account.signAuthWithSecret(payload);
                account.signWithSecret(payload);
                return payload;
            },
        });
        const args = new sdk.xdr.InvokeContractArgs({
            contractAddress: sdk.xdr.ScAddress.scAddressTypeContract(new sdk.xdr.ContractId(new Uint8Array(32).fill(3))),
            functionName: 'swap', args: [],
        });
        const entry = new sdk.xdr.SorobanAuthorizationEntry({
            credentials: sdk.xdr.SorobanCredentials[credentialType](new sdk.xdr.SorobanAddressCredentials({
                address: new sdk.Address(signer.publicKey()).toScAddress(), nonce: 1n,
                signatureExpirationLedger: 0, signature: sdk.xdr.ScVal.scvVoid(),
            })),
            rootInvocation: new sdk.xdr.SorobanAuthorizedInvocation({
                function: sdk.xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(args),
                subInvocations: [],
            }),
        });
        const tx = new sdk.TransactionBuilder(new sdk.Account(signer.publicKey(), '123'), {
            fee: '100', networkPassphrase: sdk.Networks.TESTNET,
        }).addOperation(sdk.Operation.invokeHostFunction({
            func: sdk.xdr.HostFunction.hostFunctionTypeInvokeContract(args), auth: [entry],
        })).setLedgerbounds(1, 100).setTimeout(0).build();
        client.status = 'trade';
        const response = await new Promise((resolve, reject) => {
            client.send = resolve;
            client.notifyError = reject;
            client.processMessage({ data: JSON.stringify({ type: 'tx', xdr: tx.toXdr(), networkFee: '100' }) });
        });
        const signed = sdk.TransactionBuilder.fromXdr(response.xdr, sdk.Networks.TESTNET);
        assertSigned(signed);
        const signedEntry = signed.operations[0].auth[0];
        assert.equal(signedEntry.credentials.type, credentialType);
        assert.equal(signedEntry.credentials.value.signatureExpirationLedger, 101);
        const [{ signature }] = sdk.scValToNative(signedEntry.credentials.value.signature);
        const preimage = sdk.buildAuthorizationEntryPreimage(signedEntry, 101, sdk.Networks.TESTNET);
        assert(signer.verify(sdk.hash(preimage.toXdr()), signature));
    });
}
