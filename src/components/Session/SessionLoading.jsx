import React from 'react';
import Generic from '../Generic';
import Loading from '../Loading';
import Ellipsis from '../Ellipsis';

export default function SessionLoading() {
    return (
        <Generic title="Loading account">
            <Loading>
                Contacting network and loading account
                <Ellipsis />
            </Loading>
        </Generic>
    );
}
