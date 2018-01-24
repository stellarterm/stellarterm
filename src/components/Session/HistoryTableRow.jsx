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

  Each case returns an object with the following properties that are then
  placed within a template that is returned and exported:

  1) title: the title of the action, ex: Account Created
  2) attributes: an array of attribute objects related to the effect
    a. header: the attribute label, ex: "STARTING BALANCE: "
    b. value: the attribute value, ex: "2828.292929200"
    c. isAsset(optional): Speficies if the attribute represents an asset.
                          This is used for special formatting within the
                          template including the hover property which is
                          used to show asset cards.
    d. asset_code(optional)
    e. asset_issuer(optional)
    f. domain(optional)
*/
const React = window.React = require('react');
import Printify from '../../lib/Printify';
import AssetCard2 from '../AssetCard2.jsx';
import directory from '../../directory'

export default class HistoryTableRow extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const d = this.props.data
    let details;
    switch(this.props.type) {

      // Case 1 ACCOUNT
      case 'account':
        switch(d.category) {

          // Case 1.1 CREATED
          // Returns a component with the starting balance and the funding public key.
          case 'account_created':
            details = {
              title: "Account Created",
              attributes: [
                {
                  header: "STARTING BALANCE: ",
                  value: Printify.lightenZeros(d.starting_balance),
                  isAsset: true,
                  asset_code: "XLM",
                  asset_issuer: null,
                  domain: "native",
                },
                {
                  header: "FUNDED BY: ",
                  value: d.funder,
                }
              ]
            }
          break;

          // Case 1.2 HOME DOMAIN UPDATED
          // Returns a compnent with the name of the new home domain.
          case "account_home_domain_updated":
            details = {
              title: "Home Domain updated",
              attributes: [
                {
                  header: "NEW DOMAIN: ",
                  value: d.home_domain,
                }
              ]
            }
            break;

          // Case 1.3 FLAGS UPDATED
          // Returns a component listing the updated flags (both set and/or clear).
          case "account_flags_updated":
            const setFlags = d.set_flags_s ? d.set_flags_s.map( flag => "set_flag_" + flag ).join(", ") : ""
            const clearFlags = d.clear_flags_s ? d.clear_flags_s.map( flag => "clear_flag_" + flag ).join(", ") : ""
            details = {
              title: "Flags updated",
              attributes: [
                {
                  header: "FLAGS: ",
                  value: setFlags + clearFlags,
                }
              ]
            }
            break;

          // Case 1.4 THRESHOLDS UPDATED
          // Returns a component with the updated thresholds
          case "account_thresholds_updated":
            details = {
              title: "Thresholds Weights updated",
              attributes: [
                {
                  header: "HIGH: ",
                  value: d.high_threshold,
                },
                {
                  header: "MEDIUM: ",
                  value: d.med_threshold,
                },
                {
                  header: "LOW: ",
                  value: d.low_threshold,
                }
              ]
            }
            break;

          // Case 1.5, 1.6, and 1.7 SELF SENT, CREDITED and DEBITED
          // Returns a component with the asset, the amount, and the source/destination
          default:
            if(d.to == d.from && d.category === 'account_debited') {
              details = {
                title: "Sent to self",
                attributes: [
                  {
                    header: "AMOUNT: ",
                    value: Printify.lightenZeros(d.amount),
                    isAsset: true,
                    asset_code: d.asset_code,
                    asset_issuer: d.asset_issuer,
                    domain: d.asset_code ? directory.resolveAssetByAccountId(d.asset_code, d.asset_issuer).domain : "native",
                  },
                  {
                    header: "TO: ",
                    value: d.to + " (self)",
                  },
                  {
                    header: "FROM:  ",
                    value: d.from + " (self)",
                  }
                ]
              }
            } else {
              details = {
                title: d.category === 'account_debited' ? "Sent" : "Received",
                attributes: [
                  {
                    header: "AMOUNT: ",
                    value: Printify.lightenZeros(d.amount),
                    isAsset: true,
                    asset_code: d.asset_code,
                    asset_issuer: d.asset_issuer,
                    domain: d.asset_code ? directory.resolveAssetByAccountId(d.asset_code, d.asset_issuer).domain : "native",
                  },
                  {
                    header: d.category === 'account_debited' ? "TO:  " : "FROM:  ",
                    value: d.to ? d.to : ( d.from ? d.from : d.source_account || ""),
                  }
                ]
              }
            }
        }
        break;

      // Case 2 SIGNER
      // Each has the same relevant data, so they all return the same component.
      case 'signer':
        var action = d.category.split("_")[1];
        if (d.inflation_dest) {
          details = {
            title: "Inflation set",
            attributes: [
              {
                header: "INFLATION DEST: ",
                value: d.inflation_dest,
              }
            ]
          }
        } else {
          details = {
            title: "Signer " + action,
            attributes: [
              {
                header: "KEY WEIGHT: ",
                value: d.weight,
              },
              {
                header: "KEY: ",
                value: d.public_key,
              }
            ]
          }
        }
        break;

      // Case 3 TRADE
      // For now, pending and updated offers are not recorded by the Effects SDK, only completed trades.
      case 'trade':
        details = {
          title: "Traded",
          attributes: [
            {
              header: "SOLD: ",
              value: Printify.lightenZeros(d.sold_amount),
              isAsset: true,
              asset_code: d.sold_asset_code,
              asset_issuer: d.sold_asset_issuer,
              domain: d.sold_asset_code ? directory.resolveAssetByAccountId(d.sold_asset_code, d.sold_asset_issuer).domain : "native",
            },
            {
              header: "BOUGHT: ",
              value: Printify.lightenZeros(d.bought_amount),
              isAsset: true,
              asset_code: d.bought_asset_code,
              asset_issuer: d.bought_asset_issuer,
              domain: d.bought_asset_code ? directory.resolveAssetByAccountId(d.bought_asset_code, d.bought_asset_issuer).domain : "native",
            }
          ]
        }
        break;

      // Case 4 Trustline
      // Each has the same relevant data, so they all return the same component.
      case 'trustline':
        details = {
          title: "Trustline " + d.category.split("_")[1],
          attributes: [
            {
              header: "ASSET: ",
              value: "",
              isAsset: true,
              asset_code: d.asset_code,
              asset_issuer: d.asset_issuer,
              domain: directory.resolveAssetByAccountId(d.asset_code, d.asset_issuer).domain,
            },
            {
              header: "ADDRESS: ",
              value: d.asset_issuer,
            }
          ]
        }
        break;
    }

    return (<div className="HistoryView__card">
      <div className="HistoryView__card__container">
        <h3 className="HistoryView__card__container__title">{details.title}</h3>
        {
          details.attributes.map( (x,i) => (
            <div key={i} className="HistoryView__card__line">
              <span className="HistoryView__card__container__header">{x.header} </span> {x.value}
                  {
                    x.isAsset ?
                      (<span className="HistoryView__asset">
                        {x.asset_code || "XLM"}-{x.domain}
                        <div className="HistoryView__asset__card">
                          <AssetCard2 code={x.asset_code || 'XLM'} issuer={x.asset_issuer || null}/>
                        </div>
                      </span>)
                    : ""
                  }
            </div>
          ))
        }
        <div className="HistoryView__external">
          View in external website:&nbsp;
          <a href={'https://stellar.expert/explorer/tx/' + d.transaction_hash} target="_blank" rel="nofollow noopener noreferrer">stellar.expert</a>&nbsp;
          <a href={'https://horizon.stellar.org/transactions/' + d.transaction_hash} target="_blank" rel="nofollow noopener noreferrer">Horizon</a>
        </div>
        <div className="HistoryView__external">
          Transaction ID: <strong>{d.transaction_hash}</strong>
        </div>
      </div>
    </div>)
  }
};
