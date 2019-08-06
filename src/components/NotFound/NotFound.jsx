import React from 'react';
import { Link } from 'react-router-dom';

export default () => (
    <div className="so-back islandBack islandBack--t">
        <div className="island">
            <div className="island__header">Page not found</div>
            <div className="OfferTables island__sub">
                <div className="OfferTables__tables island__sub__division island--simplePadTB">
                    The requested page was not found. Try going to the <Link to="/">home page</Link> to navigate to
                    where you want to go.
                </div>
                <div className="OfferTables__table island__sub__division" />
            </div>
        </div>
    </div>
);
