// This is a directory that maps issuer account IDs to their issuers
import _ from 'lodash';
import logos from './logos';
import directoryBuilder from './directoryBuilder';

// TODO: Use functions to populate this list (which can then have stronger validation)
let data = {
  'stellarterm.com': {
    name: 'stellarterm.com',
    website: 'https://stellarterm.com/', // optional
    assets: [
      {
        code: 'DEMO',
        issuer: 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE',
      }
    ],
    logo: logos['stellarterm.com'],
  },
  'naobtc.com': {
    name: 'naobtc.com',
    website: 'https://naobtc.com/',
    assets: [
      {
        code: 'BTC',
        issuer: 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH',
      }
    ],
    logo: logos['naobtc.com'],
  },
  'coins.asia': {
    name: 'coins.asia',
    website: 'https://coins.asia/',
    assets: [
      {
        code: 'PHP',
        issuer: 'GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP',
      }
    ],
    logo: logos['coins.asia'],
  },
  'tempo.eu.com': {
    name: 'tempo.eu.com',
    website: 'https://tempo.eu.com/',
    assets: [
      {
        code: 'EURT',
        issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
      }
    ],
    logo: logos['tempo.eu.com'],
  },
  'moni.com': {
    name: 'moni.com',
    website: 'https://moni.com/',
    assets: [
      {
        code: 'EUR',
        issuer: 'GAKBPBDMW6CTRDCXNAPSVJZ6QAN3OBNRG6CWI27FGDQT2ZJJEMDRXPKK',
      }
    ],
    logo: logos['moni.com'],
  },
  'ripplefox.com': {
    name: 'ripplefox.com',
    website: 'https://ripplefox.com/anchor/',
    assets: [
      {
        code: 'CNY',
        issuer: 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX',
      }
    ],
    logo: logos['ripplefox.com'],
  },
  'mobius.network': {
    name: 'mobius.network',
    website: 'https://mobius.network/',
    assets: [
      {
        code: 'MOBI',
        issuer: 'GDCIUCGL7VEMMF6VYJOW75KQ5ZCLHAQBRM6EPFTKCRWUYVUOOYQCKC5A',
      }
    ],
    logo: logos['mobius.network'],
  },
  'gft.network': {
    name: 'gft.network',
    website: 'https://gft.network/',
    assets: [
      {
        code: 'GFT',
        issuer: 'GAAZUE4PKMKLA7QC2MPUIUXY7BZK2WUCK7Q5EELSDLK4FE3X4DZTSCKN'
      }
    ],
    logo: logos['gft.network'],
  },
  'collective21.org': {
    name: 'collective21.org',
    website: 'http://www.collective21.org/',
    assets: [
      {
        code: 'SEED',
        issuer: 'GDPFSEBZO2W4TLWZO7FIMMG3QONHXYVF6LUULI6HUJS6PJLE4TRZEXLF'
      }
    ],
    logo: logos['collective21.org'],
  },
  'tonaira.com': {
    name: 'tonaira.com',
    website: 'https://tonaira.com/',
    assets: [
      {
        code: 'NGN',
        issuer: 'GCLRUZDCWBHS7VIFCT43BARPP63BHR32HMEVKXYQODA5BU6SIGFK4HL2',
      }
    ],
    logo: logos['tonaira.com'],
  },
  'equid.co': {
    name: 'equid.co',
    website: 'https://equid.co/',
    assets: [
      {
        code: 'EQD',
        issuer: 'GCGEQJR3E5BVMQYSNCHPO6NPP3KOT4VVZHIOLSRSNLE2GFY7EWVSLLTN',
      },
    ],
    logo: logos['equid.co'],
  },
  'liquido.i-server.org': {
    name: 'liquido.i-server.org',
    website: 'https://liquido.i-server.org/',
    assets: [
      {
        code: 'XLQ',
        issuer: 'GD2RRX6BKVTORZ6RIMBLWFVUOAYOLTS2QFJQUQPXLI3PBHR3TMLQNGZX',
      }
    ],
    logo: logos['liquido.i-server.org'],
  },
  'bitcoinfundi.com': {
    name: 'bitcoinfundi.com',
    website: 'https://bitcoinfundi.com/',
    assets: [
      {
        code: 'USD',
        issuer: 'GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R',
      },
      {
        code: 'BTC',
        issuer: 'GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R',
      }
    ],
    logo: logos['bitcoinfundi.com'],
  },
  'vcbear.net': {
    name: 'vcbear.net',
    website: 'https://vcbear.net/',
    assets: [
      {
        code: 'JPY',
        issuer: 'GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM',
      },
      {
        code: 'XRP',
        issuer: 'GA7FCCMTTSUIC37PODEL6EOOSPDRILP6OQI5FWCWDDVDBLJV72W6RINZ',
      },
      {
        code: 'BTC',
        issuer: 'GDXTJEK4JZNSTNQAWA53RZNS2GIKTDRPEUWDXELFMKU52XNECNVDVXDI',
      }
    ],
    logo: logos['vcbear.net'],
  },
  'cryptomover.com': {
    name: 'cryptomover.com',
    website: 'https://cryptomover.com/',
    assets: [
      {
        code: 'CM3',
        issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
      },
      {
        code: 'CM10',
        issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
      },
      {
        code: 'CME',
        issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
      },
      {
        code: 'CM3x2',
        issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
      },
      {
        code: 'HKDC',
        issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
      },
    ],
    logo: logos['cryptomover.com'],
  },
  'readycash.com.ng': {
    name: 'readycash.com.ng',
    website: 'https://readycash.com.ng/',
    assets: [
      {
        code: 'NGN',
        issuer: 'GA3TKVAAVRPSOO7YAKCTFA2Z22PJMFT2YWNJLNMTIVLVLEPLE2SZIRXU',
      }
    ],
    logo: logos['readycash.com.ng'],
  },
  'btc.papayame.com': {
    name: 'btc.papayame.com',
    website: 'https://btc.papayame.com/',
    assets: [
      {
        code: 'BTC',
        issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
      }
    ],
    logo: logos['papayame.com'],
  },
  'ltc.papayame.com': {
    name: 'ltc.papayame.com',
    website: 'https://ltc.papayame.com/',
    assets: [
      {
        code: 'LTC',
        issuer: 'GC5LOR3BK6KIOK7GKAUD5EGHQCMFOGHJTC7I3ELB66PTDFXORC2VM5LP',
      }
    ],
    logo: logos['papayame.com'],
  },
  'erc20.papayame.com': {
    name: 'erc20.papayame.com',
    website: 'https://erc20.papayame.com/',
    assets: [
      {
        code: 'ICN',
        issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
      }
    ],
    logo: logos['papayame.com'],
  },
};

let specialData = {
  'Stellar Network': {
    name: 'Stellar Network',
    assets: [
      {
        code: 'XLM',
        issuer: null,
      }
    ],
    logo: logos['stellar'],
  },
  'unknown': {
    name: 'unknown',
    logo: logos['unknown'],
  }
};

let dataByIssuer = {};

_.each(data, source => {
  let foundIssuers = {}; // deduplicate account ids
  _.each(source.assets, asset => {
    foundIssuers[asset.issuer] = true;
  })

  _.each(foundIssuers, (v, accountId) => {
    if (dataByIssuer[accountId] !== undefined) {
      throw new Error('Duplicate issuer from multiple sites');
    }
    dataByIssuer[accountId] = source;
  })
});

let destinations = {};
function addDestination(accountId, opts) {
  if (!opts.name) {
    throw new Error('Name required for destinations');
  }
  destinations[accountId] = {
    name
  };
  if (opts.requiredMemoType) {
    if (!(opts.requiredMemoType == 'MEMO_TEXT'
       || opts.requiredMemoType == 'MEMO_ID'
       || opts.requiredMemoType == 'MEMO_HASH'
       || opts.requiredMemoType == 'MEMO_RETURN')) {
      throw new Error('Invalid memo type when adding destination');
    }
    destinations[accountId].requiredMemoType = opts.requiredMemoType;
  }
}

addDestination('GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM', {
  name: 'Kraken',
  requiredMemoType: 'MEMO_ID',
});
addDestination('GCGNWKCJ3KHRLPM3TM6N7D3W5YKDJFL6A2YCXFXNMRTZ4Q66MEMZ6FI2', {
  name: 'Poloniex',
  requiredMemoType: 'MEMO_ID',
});
addDestination('GB6YPGW5JFMMP2QB2USQ33EUWTXVL4ZT5ITUNCY3YKVWOJPP57CANOF3', {
  name: 'Bittrex',
  requiredMemoType: 'MEMO_ID',
});
addDestination('GB7GRJ5DTE3AA2TCVHQS2LAD3D7NFG7YLTOEWEBVRNUUI2Q3TJ5UQIFM', {
  name: 'BTC38',
  requiredMemoType: 'MEMO_ID',
});
addDestination('GBV4ZDEPNQ2FKSPKGJP2YKDAIZWQ2XKRQD4V4ACH3TCTFY6KPY3OAVS7', {
  name: 'Changelly',
  requiredMemoType: 'MEMO_ID',
});

module.exports = {
  data,
  destinations,
  getSourceByFederation(federation) {
    if (data.hasOwnProperty(federation)) {
      return data[federation];
    }
    return specialData.unknown;
  },
  getSourceById(accountId) {
    if (accountId === undefined || accountId === null) {
      return specialData['Stellar Network'];
    }

    // Will always return a source. If no source is found, it will return the unknown source
    if (!dataByIssuer.hasOwnProperty(accountId)) {
      return specialData.unknown;
    }
    return dataByIssuer[accountId];
  },
  getAllSources() {
    return data
  },
};
