import React from 'react';
import images from '../../../../images';

export default class FullscreenScrollBlock extends React.Component {
    static checkIsScrollOnTop() {
        return window.scrollY === 0;
    }

    constructor(props) {
        super(props);

        this.state = {
            isScrollOnTop: this.constructor.checkIsScrollOnTop(),
        };
        this.handleWindowScroll = this.handleWindowScroll.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleWindowScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleWindowScroll);
    }

    handleWindowScroll() {
        const isScrollOnTop = this.constructor.checkIsScrollOnTop();

        if (this.state.isScrollOnTop !== isScrollOnTop) {
            this.setState({ isScrollOnTop });
        }
    }

    render() {
        const { isScrollOnTop } = this.state;

        return (
            <div
                className="scrollHere_info"
                onClick={isScrollOnTop
                        ? () => window.scrollTo({ top: 500, behavior: 'smooth' })
                        : () => window.scrollTo({ top: 0, behavior: 'smooth' })
                }>
                <span>Click here to scroll {isScrollOnTop ? 'down' : 'to top'}</span>

                <img
                    className={`icon_downArrow ${isScrollOnTop ? '' : 'arrow-reverse180'}`}
                    src={images.dropdown}
                    alt="arrow_down" />
            </div>
        );
    }
}
