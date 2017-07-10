const React = window.React = require('react');
import _ from 'lodash';

export default class Send extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log('hi');
    return <div className="island">
      <div className="island__header">
        Send payment
      </div>
      <div className="Send__panel">
        <h3 className="Send__title">
          1. Select destination<a className="Send__title__edit">Edit</a>
        </h3>
          - Input field validate accountid
          - Input field validate
          - Try to resolve it to an accountId
      </div>
      <div className="Send__separator"></div>
      <div className="Send__panel is-inactive">
        <h3 className="Send__title">
          2. Select asset
        </h3>
          - If account doesn't exist list lumens
          - Else list all mutual assets
      </div>
      <div className="Send__separator"></div>
      <div className="Send__panel is-inactive">
        <h3 className="Send__title">
          3. Select amount
        </h3>
        Please finish the previous steps first.
      </div>
    </div>
  }
}
