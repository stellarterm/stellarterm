import React from 'react';

const TOTAL_DOTS = 3;

export default class Ellipsis extends React.Component {
    constructor(props) {
        super(props);
        this.state = { visibleDots: 0 };
    }

    componentDidMount() {
        this.timeout = setTimeout(() => this.tick(), 300);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    tick() {
        const visibleDots = (this.state.visibleDots + 1) % (TOTAL_DOTS + 1);
        this.setState({ visibleDots });
        this.timeout = setTimeout(() => this.tick(), 300);
    }

    createDots() {
        return new Array(TOTAL_DOTS)
            .fill('Ellipsis__dot')
            .fill('Ellipsis__dot is-hidden', this.state.visibleDots)
            .map((className, index) => (
                <span key={index.toString()} className={className}>
                    .
                </span>
            ));
    }

    render() {
        return <span className="Ellipsis">{this.createDots()}</span>;
    }
}
