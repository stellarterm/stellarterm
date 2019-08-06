import React from 'react';
import _ from 'lodash';
import directory from 'stellarterm-directory';
import AssetCard2 from '../../../../Common/AssetCard2/AssetCard2';
import TrustButton from '../../../../Common/AssetRow/TrustButton/TrustButton';

export default function DepositAnchors(props) {
    const anchorRows = [];

    _.each(directory.anchors, (anchor) => {
        _.each(anchor.assets, (assetId) => {
            const assetParts = assetId.split('-');
            const assetCode = assetParts[0];

            if (assetCode === props.selectedAssetCode) {
                const assetIssuer = assetParts[1];
                const name = anchor.name;
                const asset = new StellarSdk.Asset(assetCode, assetIssuer);
                const instructions = directory.assets[assetId].instructions || '';

                const trustRow = (
                    <tr className="row" key={`${name}_${assetCode}_${assetIssuer}`}>
                        <td className="row__item--assetCard">
                            <AssetCard2 code={assetCode} issuer={assetIssuer} />
                        </td>

                        <td className="row__shareOption">
                            <TrustButton
                                d={props.d}
                                asset={asset}
                                message={instructions}
                                trustMessage={`Trust ${asset.getCode()}`} />
                        </td>
                    </tr>
                );
                anchorRows.push(trustRow);
            }
        });
    });

    return (
        <div>
            <div className="island__paddedContent">
                <p>
                    This is a list of anchors from the Stellar community.
                    <br />
                    Note: StellarTerm does not endorse any of these anchors.
                </p>
            </div>

            <table className="row__full_width">
                <tbody>{anchorRows}</tbody>
            </table>
        </div>
    );
}
