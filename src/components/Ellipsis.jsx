import React from 'react';

const TOTAL_DOTS = 3;

export default class Ellipsis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleDots: 0, // 0 indexed
        };

        this.tick = () => {
            if (this.mounted) {
                this.setState({
                    visibleDots: (this.state.visibleDots + 1) % (TOTAL_DOTS + 1),
                });
                setTimeout(this.tick, 300);
            }
        };
    }

    componentDidMount() {
        this.mounted = true;
        setTimeout(this.tick, 300);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    createDots() {
        const dots = [];
        let dotsNum = 0;

        while (dotsNum < TOTAL_DOTS) {
            dots.push(
                <span key={dotsNum} className={`Ellipsis__dot${dotsNum >= this.state.visibleDots ? ' is-hidden' : ''}`}>
                    .
                </span>,
            );
            dotsNum += 1;
        }
        return dots;
    }

    render() {
        return <span className="Ellipsis">{this.createDots()}</span>;
    }
}
