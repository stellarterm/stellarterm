import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import slides from './SignUpSlides.json';
import images from './../../../../../images';


export default class SignUpPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeSlideIndex: 0,
            slideDirection: '',
        };
    }

    componentDidMount() {
        this.startSlideShow();
    }

    componentWillUnmount() {
        this.stopSlideShow();
    }

    startSlideShow() {
        this.timeout = setTimeout(() => {
            this.nextSlide();
            this.startSlideShow();
        }, 7000);
    }

    stopSlideShow() {
        clearTimeout(this.timeout);
    }

    nextSlide() {
        const { activeSlideIndex } = this.state;
        this.setState({
            activeSlideIndex: (activeSlideIndex === slides.length - 1) ? 0 : activeSlideIndex + 1,
            slideDirection: 'slide-left',
        });
    }

    renderCarouselDots() {
        const { activeSlideIndex } = this.state;
        const dots = Array.from({ length: slides.length }, (item, index) =>
            <div
                key={index}
                onClick={() =>
                    this.setState({
                        activeSlideIndex: index,
                        slideDirection: activeSlideIndex > index ? 'slide-right' : 'slide-left',
                    })}
                className={`SignUpPreview_slide-dot ${index === activeSlideIndex ? 'active' : ''}`} />);

        return (
            <div className="SignUpPreview_slide-dots">{dots}</div>
        );
    }

    renderSlide() {
        const { activeSlideIndex, slideDirection } = this.state;
        const slide = slides[activeSlideIndex];

        return (
            <div
                onMouseEnter={() => this.stopSlideShow()}
                onMouseLeave={() => this.startSlideShow()}
                className={`SignUpPreview_slide ${slideDirection}`}
                key={activeSlideIndex}>
                <img src={images[slide.image]} alt="img" className="SignUpPreview_slide-image" />
                <span className="SignUpPreview_slide-title">{slide.title}</span>
                <span className="SignUpPreview_slide-desc">{slide.desc}</span>
            </div>
        );
    }

    render() {
        const slide = this.renderSlide();
        const dots = this.renderCarouselDots();
        return (
            <div className="SignUpPreview">
                {slide}
                {dots}
                <button onClick={() => this.props.nextStep()} className="s-button">New Stellar account</button>
                <span className="LoginPage__signupInvite">
                    Already have an account? <Link to="/account/">Log in</Link>
                </span>
            </div>
        );
    }
}
SignUpPreview.propTypes = {
    nextStep: PropTypes.func,
};
