const React = window.React = require('react');
// import Select from 'react-select';

export default class DepositCurrency extends React.Component {
  constructor(props) {
    super(props);

    this.optionRenderer = (option) => {
      return (
        <div className="Deposit__dropdown_option">
          <div>{option.label}</div>
        </div>
      );
    };
  }

  render() {
    const codes = Array.from(new Set(this.props.allAssets.map(asset => asset.code)));
    const options = codes.map(code => ({ value: code, label: code }));
    const selectedValue = { value: this.props.selectedAsset, label: this.props.selectedAsset };
    return <div>Feature not active</div>
    // return (
    //   <div>
    //     <Select
    //       clearable={false}
    //       options={options}
    //       value={selectedValue}
    //       onChange={(newValue) => this.props.onCurrencyChange(newValue.value)}
    //       optionRenderer={this.optionRenderer}
    //       valueRenderer={this.optionRenderer}
    //     />
    //   </div>
    // );
  }
}
