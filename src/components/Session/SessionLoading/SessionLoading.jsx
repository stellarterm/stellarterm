import React from 'react';
import Generic from '../../Common/Generic/Generic';
import Loading from '../../Common/Loading/Loading';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';

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
