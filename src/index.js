import React, { Component } from "react";
import { withGesture } from "react-with-gesture";
import { Spring, animated } from "react-spring";
import debounce from "lodash/debounce";

import LeftArrow from "./assets/images/arrow-left.png";
import RightArrow from "./assets/images/arrow-right.png";
import "./assets/scss/carousel.scss";

class ReactSpringCarousel extends Component {
  static defaultProps = {
    infinite: true,
    rewind: false,
    slidesToShow: 3,
    springConfig: {
      mass: 1,
      tension: 300,
      friction: 10,
      clamp: true
    },
    centerMode: true
  };
  constructor(props) {
    super(props);
    //console.log(this.props);
    this.slideRefs = [];
    this.state = {
      onSlide: 0,
      slides: [],
      numSlides: 0,
      cutToSlideOnRest: false,
      dragging: false
    };
    this.sliderRef = React.createRef();
    this.forceRepaint = debounce(this.forceRepaint, 100);
  }

  calculateSlides() {
    this.slideRefs = [];
    const childSlides = this.props.children || [];
    const slides = [
      ...childSlides.map((slide, i) => ({
        el: { ...slide },
        clone: true,
        index: i
      })),
      ...childSlides.map((slide, i) => ({
        el: { ...slide },
        clone: false,
        index: i
      })),
      ...childSlides.map((slide, i) => ({
        el: { ...slide },
        clone: true,
        index: i
      }))
    ];
    slides.forEach((slide, i) => {
      this.slideRefs.push(React.createRef());
    });
    const numSlides = childSlides.length;
    this.setState({ ...this.state, slides, numSlides }, this.forceRepaint);
  }

  componentDidMount() {
    window.addEventListener("resize", this.forceRepaint);
    this.calculateSlides();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.forceRepaint);
  }

  forceRepaint = () => {
    this.forceUpdate();
  };

  prev = e => {
    e.preventDefault();
    this.incrementSlide(-1);
  };

  next = e => {
    e.preventDefault();
    this.incrementSlide(1);
  };

  toSlide = toSlide => {
    const { onSlide } = this.state;
    this.incrementSlide(toSlide - onSlide);
  };

  incrementSlide = (n, cb = () => {}) => {
    const { onSlide, numSlides } = this.state;
    let { cutToSlideOnRest } = this.state;
    const { infinite, rewind } = this.props;
    let toSlide = onSlide + n;

    //Why are we doing this again?
    const slideDiff = toSlide % (numSlides - 0);
    if (toSlide >= numSlides) {
      if (infinite) {
        cutToSlideOnRest = slideDiff;
      } else if (rewind) {
        toSlide = 0;
      } else {
        toSlide = numSlides - 1;
      }
    } else if (toSlide < 0) {
      if (infinite) {
        cutToSlideOnRest = numSlides + slideDiff;
      } else if (rewind) {
        toSlide = numSlides - 1;
      } else {
        toSlide = 0;
      }
    }
    this.setState(
      {
        ...this.state,
        onSlide: toSlide,
        cutToSlideOnRest
      },
      cb
    );
  };

  cutToSlide(toSlide, cb = () => {}) {
    this.setState(
      {
        ...this.state,
        onSlide: toSlide,
        noAnimate: true,
        cutToSlideOnRest: false
      },
      () => {
        this.setState(
          {
            ...this.state,
            noAnimate: false
          },
          cb
        );
      }
    );
  }

  calculateSlideSizes = () => {
    let slideSizes = [];
    this.slideRefs.forEach(ref => {
      slideSizes.push(this.calculateElementSizeFromRef(ref));
    });
    return slideSizes;
  };

  calculateElementSizeFromRef({ current }) {
    return {
      width: current && current.clientWidth ? current.clientWidth : 0,
      height: current && current.clientHeight ? current.clientHeight : 0
    };
  }

  calculateOffset = onSlide => {
    const slideSizes = this.calculateSlideSizes();
    let offset = 0;
    const buffer = this.state.numSlides;
    const { centerMode } = this.props;
    if (slideSizes) {
      const slidesToCalculate = slideSizes.slice(0, onSlide + buffer);
      if (slidesToCalculate) {
        offset = slidesToCalculate.reduce((prev, curr) => prev + curr.width, 0);
      }
    }
    if (centerMode) {
      const targetSlide = this.wrapAroundCount(onSlide);
      offset -= this.calculateElementSizeFromRef(this.sliderRef).width / 2;
      if (slideSizes[targetSlide]) {
        offset += slideSizes[targetSlide].width / 2;
      }
      if (window && this.sliderRef.current) {
        const paddingLeft = window
          .getComputedStyle(this.sliderRef.current, null)
          .getPropertyValue("padding-left")
          .replace("px", "");
        offset += parseInt(paddingLeft);
      }
    }
    return -1 * offset;
  };

  wrapAroundCount(n) {
    const { numSlides } = this.state;
    if (numSlides <= 0) {
      return;
    }
    if (n >= numSlides) {
      return n % numSlides;
    }
    if (n < 0) {
      while (n < 0) {
        n += numSlides;
      }
    }
    return n;
  }

  componentDidUpdate = prevProps => {
    //On mouse up events, we should decide if we need to increment
    const {
      down,
      delta: [xDelta, yDelta]
    } = this.props;
    const { dragging } = this.state;
    const { down: prevDown } = prevProps;
    //TODO sensibility to drag from props
    const threshold = 3;

    //First Mouse down
    if (down && !prevDown) {
      //don't bother updating state if we weren't previously dragging
      if (!dragging) {
        this.setState({
          ...this.state,
          dragging: false
        });
      }
    }

    //Dragging / long click
    if (down) {
      //we only want to capture the first dragging past the threshold
      if (!dragging) {
        if (Math.abs(xDelta) >= threshold || Math.abs(yDelta) >= threshold) {
          this.setState({
            ...this.state,
            dragging: true
          });
        }
      }
    }

    //Mouse Up
    //If this is the first mouse up event, we'll do the calculation
    if (!down && prevDown) {
      const { onSlide } = this.state;
      let increment = 0;
      const slideSizes = this.calculateSlideSizes();
      const targetSlide = this.wrapAroundCount(onSlide);
      if (xDelta > slideSizes[targetSlide].width / 2) {
        increment = -1;
      } else if (xDelta < (-1 * slideSizes[targetSlide].width) / 2) {
        increment = 1;
      }
      if (increment) {
        this.incrementSlide(increment, () => {
          //basically wait for the click to fire...
          //there's gotta be a more legit way to do this
          setTimeout(() => {
            this.setState({ ...this.state, dragging: false });
          }, 0);
        });
      } else {
        setTimeout(() => {
          //basically wait for the click to fire...
          //there's gotta be a more legit way to do this
          this.setState({ ...this.state, dragging: false });
        }, 0);
      }
    }

    const childSlides = this.props.children || [];
    if (childSlides.length !== this.state.numSlides) {
      this.calculateSlides();
    }
  };

  onRest = () => {
    const { cutToSlideOnRest } = this.state;
    if (cutToSlideOnRest !== false) {
      this.cutToSlide(cutToSlideOnRest, () => {
        this.setState({ interaction: "rest" });
      });
    } else {
      this.setState({ interaction: "rest" });
    }
  };

  handleClick = e => {
    //if dragging, block click actions
    if (this.state.dragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  render() {
    //Data provided from withGesture
    const {
      delta: [xDelta],
      down
    } = this.props;

    //get offset
    const { onSlide, noAnimate, numSlides, slides } = this.state;
    const { slidesToShow } = this.props;
    const baseOffset = this.calculateOffset(onSlide);
    const offset = down ? xDelta + baseOffset : baseOffset;

    // Using slides.length instead of numSlides to account for clones
    const sliderWidth = `${(slides.length * 100) / slidesToShow}%`;

    const { springConfig } = this.props;

    const prevSlideNum = this.wrapAroundCount(onSlide - 1);
    const nextSlideNum = this.wrapAroundCount(onSlide + 1);
    return (
      <div className="react-spring-carousel" ref={this.sliderRef}>
        <Spring
          config={springConfig}
          native
          to={{ x: offset }}
          onRest={this.onRest}
          onStart={() => {
            this.setState({ interaction: "start" });
          }}
          after={() => {
            this.setState({ interaction: "after" });
          }}
          immediate={noAnimate}
        >
          {({ x }) => (
            <animated.div
              className="react-spring-carousel__inner"
              style={{
                transform: x.interpolate(x => `translate3d(${x}px,0,0)`),
                width: sliderWidth
              }}
            >
              {slides.map((slide, i) => (
                <ReactSpringCarouselSlide
                  key={i}
                  ref={this.slideRefs[i]}
                  handleClick={this.handleClick}
                  slideIndex={slide.index}
                  isClone={slide.clone}
                  //TO DO: this needs to be correctly calculated
                  //e.g. react-spring-carousel__slide--distance_1 is the same as next
                  //e.g. react-spring-carousel__slide--distance_-1 is the same as prev
                  relFromActive={slide.index - onSlide}
                  isPrev={slide.index === prevSlideNum}
                  isNext={slide.index === nextSlideNum}
                  isActive={slide.index === onSlide}
                  onSlide={onSlide}
                  numSlides={numSlides}
                >
                  {slide.el}
                </ReactSpringCarouselSlide>
              ))}
            </animated.div>
          )}
        </Spring>
        <div className="react-spring-carousel__controls">
          <button
            className="react-spring-carousel__controls__arrow react-spring-carousel__controls__arrow--left"
            onClick={this.prev}
          >
            <img src={LeftArrow} alt="Previous" />
            Previous
          </button>
          <button
            className="react-spring-carousel__controls__arrow react-spring-carousel__controls__arrow--right"
            onClick={this.next}
          >
            <img src={RightArrow} alt="Next" />
            Next
          </button>
          <ul className="react-spring-carousel__controls__dots">
            {Array.apply(null, { length: numSlides }).map((x, i) => {
              const additionalClasses =
                i === onSlide
                  ? "react-spring-carousel__controls__dots__dot--active"
                  : "";
              return (
                <li
                  key={i}
                  className={`react-spring-carousel__controls__dots__dot ${additionalClasses}`}
                >
                  <button
                    onClick={e => {
                      e.preventDefault();
                      this.toSlide(i);
                    }}
                  >
                    Jump to slide {i}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {/* <div className="react-spring-carousel__details">
          <div>on slide: {onSlide}</div>
          <div>interaction: {this.state.interaction}</div>
        </div> */}
      </div>
    );
  }
}

const ReactSpringCarouselSlide = React.forwardRef(
  (
    {
      children,
      handleClick,
      clone,
      slideIndex,
      isClone,
      relFromActive,
      inverseRelFromActive,
      isActive,
      isNext,
      isPrev
    },
    ref
  ) => {
    let classNames = ["react-spring-carousel__slide"];
    classNames.push(`react-spring-carousel__slide--index-${slideIndex}`);
    classNames.push(`react-spring-carousel__slide--distance_${relFromActive}`);
    if (isClone) {
      classNames.push("react-spring-carousel__slide--clone");
    }
    if (isNext) {
      classNames.push("react-spring-carousel__slide--next");
    }
    if (isPrev) {
      classNames.push("react-spring-carousel__slide--prev");
    }
    if (isActive) {
      classNames.push("react-spring-carousel__slide--active");
    } else {
      classNames.push("react-spring-carousel__slide--inactive");
    }
    return (
      <div
        className={classNames.join(" ")}
        ref={ref}
        onClickCapture={handleClick}
      >
        {children}
      </div>
    );
  }
);

export default withGesture()(ReactSpringCarousel);
