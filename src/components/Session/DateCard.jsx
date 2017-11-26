/*
  This file contains the Date Card Component.
  The Date Card Component is used to nicely format the
  Date column in the Effects History Table: HistoryTable.jsx.
  If data is still loading, will display "Loading..."
*/

const React = window.React = require('react');

export default class DateCard extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let dateCardMain = <div className="DateCard">
      <div className="DateCard__date">
          {this.props.time}
      </div>
      <div className="DateCard__ledger">
          Ledger Sequence #: {this.props.ledger}
      </div>
    </div>

    return this.props.ledger ? dateCardMain : <div>Loading...</div>
  }
};
