const React = window.React = require('react');
import _ from 'lodash';

// Generate data for testing:
// let data = [];
// let iterationTime = 1473638400000;
// let lastPrice = 100;
// while (iterationTime < Date.now()) {
//   data.push([iterationTime, lastPrice]);
//   lastPrice = lastPrice + _.random(-1, 1, true) + 0.01;
//   iterationTime += 50 * 60 * 1000 * _.random(0, 1, true); // 0-5 minutes
// }


// Highstock configuration
const minuteFullDateFormat = '%Y-%m-%d %H:%M';
const minutePartDateFormat = '%m-%d %H:%M';
const dayPartDateFormat = '%m-%d';
const dayFullDateFormat = '%Y-%m-%d';
const monthFullDateFormat = '%Y-%m';
// Display time in UK format: 17 January 2017 15:37

const axisDTLF = {
  // We also dont care to show seconds or milliseconds since it is not very relevant in the
  // context of Stellar
  millisecond: minutePartDateFormat,
  second: minutePartDateFormat,
  minute: minutePartDateFormat,
  hour: minutePartDateFormat,
  day: minutePartDateFormat,
  week: minuteFullDateFormat,
  month: dayFullDateFormat,
  year: dayFullDateFormat,
};

const dateTimeLabelFormats = {
  // We also dont care to show seconds or milliseconds since it is not very relevant in the
  // context of Stellar
  millisecond: minuteFullDateFormat,
  second: minuteFullDateFormat,
  minute: minuteFullDateFormat,
  hour: minuteFullDateFormat,
  day: minuteFullDateFormat,
  week: minuteFullDateFormat,
  month: monthFullDateFormat,
  year: '%Y',
};

const dataGroupingDateTimeLabelFormats = {
  // First option is just the date
  // Second option is the first part of a date range
  // Third option is the second part of a date range
  // For simplicity, we show date ranges as if it is one point in time
  millisecond: [minuteFullDateFormat, minuteFullDateFormat, ''],
  second: [minuteFullDateFormat, minuteFullDateFormat, ''],
  minute: [minuteFullDateFormat, minuteFullDateFormat, ''],
  hour: [minuteFullDateFormat, minuteFullDateFormat, ''],
  day: [minuteFullDateFormat, minuteFullDateFormat, ''],
  week: [minuteFullDateFormat, minuteFullDateFormat, ''],
  month: [monthFullDateFormat, monthFullDateFormat, ''],
  year: ['%Y', '%Y', '-%Y'],
};

export default class PriceChart extends React.Component {
  constructor(props) {
    super(props);
    this.rendered = false;
  }
  componentDidMount() {
    if (this.props.d.orderbook.data.trades !== undefined) {
      this.renderChart(this.props.d.orderbook.data, this.props.d.orderbook.data.trades);
    } else {
      this.unsub = this.props.d.orderbook.event.sub(() => {
        if (!this.rendered && this.props.d.orderbook.data.trades !== undefined) {
          this.renderChart(this.props.d.orderbook.data, this.props.d.orderbook.data.trades);
        }
      });
    }
  }
  componentWillUnmount() {
    if (this.unsub) {
      this.unsub();
    }
  }
  renderChart(orderbook) {
    this.rendered = true;
    let elem = document.getElementById('PriceChart');
    // We detect the height and width from the PriceChart element
    // This is so that it can be embedded into other sites easily
    const height = elem.clientHeight;
    const width = elem.clientWidth;

    const pairName = `${orderbook.baseBuying.code}/${orderbook.counterSelling.code}`;
    window.elem = elem;

    this.orderbook = orderbook;

    if (orderbook.trades.length === 0) {
      elem.getElementsByClassName('PriceChart__message')[0].textContent = `No trade history for ${pairName}`;
      return;
    }

    this.highstockOptions = {
      colors: ['#9291e0'], // Purple from background gradient
      chart: {
        style: {
          fontFamily: 'Source Sans Pro',
        },
        spacingBottom: 18,
        spacingTop: 18,
        spacingLeft: 18,
        spacingRight: 18,
        borderRadius: 4,

        height,
        width,
      },
      rangeSelector: {
        inputPosition: {
          y: 0,
        },
        inputDateFormat: dayFullDateFormat,
        inputEditDateFormat: dayFullDateFormat,
        buttons: [
          {
            type: 'hour',
            count: 6,
            text: '6h',
          },
          {
            type: 'hour',
            count: 24,
            text: '24h',
          },
          {
            type: 'day',
            count: 4,
            text: '4d',
          },
          {
            type: 'week',
            count: 1,
            text: '1w',
          },
          {
            type: 'month',
            count: 1,
            text: '1m',
          }, {
            type: 'all',
            text: 'All',
          }],
        selected: 2,
      },
      series: [{
        name: pairName,
        data: orderbook.trades,
        type: 'spline',
        dataGrouping: {
          groupPixelWidth: 8,
          dateTimeLabelFormats: dataGroupingDateTimeLabelFormats,
        },
        tooltip: {
          dateTimeLabelFormats,
          valueDecimals: 7,
          pointFormat: '{series.name}: <b>{point.y}</b><br />', // Remove the bullet point
        },
        lineWidth: 2,
        states: {
          hover: {
            enabled: false,
            // lineWidth: 2,
          },
        },
      }],
      tooltip: {
        backgroundColor: '#f4f4f5',
        borderColor: '#f4f4f5',
        borderRadius: 3,
        borderWidth: 0,
        crosshairs: [true, true],
        shadow: {
          // Same as the island stuff in StellarTerm
          color: 'rgba(0,0,0,0.375)', // 0.3/0.8=0.375 to account for tooltip opacity
          width: 3,
          offsetX: 0,
          offsetY: 1,
        },
        useHTML: true,
        style: {
          opacity: '0.8',
          cursor: 'default',
          fontSize: '12px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        },
      },
      xAxis: {
        dateTimeLabelFormats: axisDTLF,
        ordinal: false,
      },
      navigator: {
        maskFill: 'rgba(255, 255, 255, 0.45)',
        series: {
          // type: 'areaspline',
          fillOpacity: 0.4,
          lineWidth: 1,
          lineColor: '#9291e0',
          fillColor: 'rgba(146, 145, 224, 0.2)',
          shadow: false,
        },
      },
      credits: {
        enabled: false,
      },
    };

    this.stockChart = window.Highcharts.stockChart('PriceChart', this.highstockOptions);
  }
  shouldComponentUpdate() {
    if (this.stockChart !== undefined) {
      this.stockChart.series[0].setData(this.orderbook.trades)
    }
    return false;
  }
  render() {
    return <div className="so-back islandBack">
      <div className="island PriceChartChunk">
        <div id="PriceChart">
          <p className="PriceChart__message">Loading historical price data...</p>
        </div>
      </div>
    </div>;
  }
}

