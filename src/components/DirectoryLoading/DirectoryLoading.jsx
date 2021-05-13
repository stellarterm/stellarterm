import React from 'react';
import Ellipsis from '../Common/Ellipsis/Ellipsis';


export default () => (
    <div className="so-back islandBack islandBack--t">
        <div className="island">
            <div className="directory-loading-block">
                <div className="directory-loader">
                    <div className="nk-spinner" />
                </div>
                <div>
                    Directory data loading
                    <Ellipsis />
                </div>

            </div>
        </div>
    </div>
);
