import React from 'react';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';

export default () => (
    <div className="so-back islandBack islandBack--t">
        <div className="island">
            <div className="island__header">Send Payment</div>
            <div className="Send__submitting">
                Submitting transaction
                <Ellipsis />
            </div>
        </div>
    </div>
);
