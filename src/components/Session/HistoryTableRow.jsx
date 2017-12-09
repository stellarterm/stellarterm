/*
  This file contains the Effect Card Component.
  It deals with each effect with a nested switch
  statement. This nested switch statement is
  formated as so:

  outside switch: general category (account, signer, trade, trustline)

  inside switch: per category (ie for account have a switch for
                               home domain update, thresholds update, etc.)

  The reasoning behind this design is modularity. If, in the future,
  another effect is added, it simply requires adding another case to
  the switch statement.
*/
const React = window.React = require('react');
import Printify from '../../lib/Printify';
import AssetCard2 from '../AssetCard2.jsx';

export default class HistoryTableRow extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const d = this.props.data
    let EffectCardMain;

    switch(this.props.type) {

      // Case 1 ACCOUNT
      case 'account':
        switch(d.category) {

          // Case 1.1 CREATED
          // Returns a component with the starting balance and the funding public key.
          case 'account_created':
            EffectCardMain = <div className="EffectCard">
              <div className="EffectCard__container">
                <div>Starting Balance: {Printify.lightenZeros(d.starting_balance)}</div>
                <div>{"Funded By: " + d.funder}</div>
              </div>
            </div>
          break;

          // Case 1.2 HOME DOMAIN UPDATED
          // Returns a compnent with the name of the new home domain.
          case "account_home_domain_updated":
            EffectCardMain = <div className="EffectCard">
              <div className="EffectCard__domain__container">
                Home domain updated: <span className="EffectCard__domain">{d.home_domain}</span>
              </div>
            </div>
          break;

          // Case 1.3 FLAGS UPDATED
          // Returns a component listing the updated flags (both set and/or clear).
          case "account_flags_updated":
            EffectCardMain = <div className="EffectCard">
              <div className="EffectCard__domain__container">
                Flags updated:
                { d.set_flags_s ? <div className="EffectCard__flags">{d.set_flags_s.map( flag => "set_flag_" + flag ).join(", ")} </div>: <div></div> }
                { d.clear_flags_s ? <div className="EffectCard__flags">{d.clear_flags_s.map( flag => "clear_flag_" + flag ).join(", ")} </div>: <div></div> }
              </div>
            </div>
          break;

          // Case 1.4 THRESHOLDS UPDATED
          // Returns a component with the updated thresholds
          case "account_thresholds_updated":
            EffectCardMain = <div className="EffectCard">
              <div className="EffectCard__threshold">
                Threshold weights updated -- Low: {d.low_threshold} -- Medium: {d.med_threshold} -- High: {d.high_threshold}
              </div>
            </div>
          break;

          // Case 1.5 and 1.6 CREDITED and DEBITED
          // Returns a component with the asset, the amount, and the source/destination
          default:
            // Correct verbage related to the transaction direction
            const direction = d.category === 'account_debited' ? "TO: " : "FROM: ";
            // Public key of the source/destination. In the case of merged accounts,
            // this will be the source (the merged account).
            const publicKey = d.to ? d.to : ( d.from ? d.from : d.source_account || "")
            EffectCardMain = <div className="EffectCard">
              <AssetCard2 code={d.asset_code || 'XLM'} issuer={d.asset_issuer || null} isEffect={true}/>
              <div className="EffectCard__container">
                <div>Amount: {Printify.lightenZeros(d.amount)}</div>
                <div>{ direction + publicKey}</div>
              </div>
            </div>
        }
        break;

      // Case 2 SIGNER
      // Each has the same relevant data, so they all return the same component.
      case 'signer':
        EffectCardMain = <div className="EffectCard">
          <div className="EffectCard__container">
            <div>{"Weight: " + d.weight}</div>
            <div>{"Public Key: " + d.public_key}</div>
          </div>
        </div>
      break;

      // Case 3 TRADE
      // For now, pending and updated offers are not recorded by the Effects SDK, only completed trades.
      case 'trade':
        EffectCardMain = <div className="EffectCard">
          <AssetCard2 code={d.sold_asset_code || 'XLM'} issuer={d.sold_asset_issuer || null} isEffect={true} />
          <div className="EffectCard__container">
            <div>Amount:</div>
            <div>{Printify.lightenZeros(d.sold_amount)}</div>
          </div>
          {"\u2192"}
          <div className="EffectCard__spacer"></div>
          <AssetCard2 code={d.bought_asset_code || 'XLM'} issuer={d.bought_asset_issuer || null} isEffect={true} />
          <div className="EffectCard__container">
            <div>Amount:</div>
            <div>{Printify.lightenZeros(d.bought_amount)}</div>
          </div>
        </div>
        break;

      // Case 4 Trustline
      // Each has the same relevant data, so they all return the same component.
      case 'trustline':
        EffectCardMain = <div className="EffectCard">
          <AssetCard2 code={d.asset_code} issuer={d.asset_issuer} isEffect={true}/>
        </div>
      break;
    }

    return EffectCardMain
  }
};
