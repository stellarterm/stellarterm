import React from 'react';
import images from '../../../../images';

export default class FullscreenScrollBlock extends React.Component {
    static checkIsScrollOnTop() {
        return window.scrollY <= 0;
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

    onClickScrollBlock() {
        const { isScrollOnTop } = this.state;

        const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
        const top = isScrollOnTop ? 500 : 0;

        if (supportsNativeSmoothScroll) {
            const behavior = 'smooth';
            window.scrollTo({ top, behavior });
        } else {
            window.scrollTo(0, top);
        }
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
            <React.Fragment>
                <div className="scrollHere_info" onClick={() => this.onClickScrollBlock()}>
                    <span>Click here to scroll {isScrollOnTop ? 'down' : 'to top'}</span>

                    <img
                        className={`icon_downArrow ${isScrollOnTop ? '' : 'arrow-reverse180'}`}
                        src={images.dropdown}
                        alt="arrow_down" />
                </div>

                {!isScrollOnTop ? (
                    <a className="btn_scrollToTop" onClick={() => this.onClickScrollBlock()}>
                        <img src={images['icon-rightArrow']} alt="arrow" />
                    </a>
                ) : null}
            </React.Fragment>
        );
    }
}
