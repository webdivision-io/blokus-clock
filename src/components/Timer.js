import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { MdRefresh as RotationIcon } from 'react-icons/md';
import css from './Timer.module.css';

const formatTime = seconds =>
    new Intl.DateTimeFormat('pl-PL', {
        minute: 'numeric',
        second: 'numeric',
    }).format(new Date(seconds * 1000));

class Timer extends React.Component {
    intervalId = null;
    static timerId = 1;

    constructor(props) {
        super(props);
        this.timerId = Timer.timerId++;
    }

    state = {
        initialValue: this.props.initialValue,
        value: this.props.initialValue,
        currentAngle: 0,
    };

    handleButtonClick = () => {
        const { onTimerClick } = this.props;

        onTimerClick(this.timerId);

        this.startTimer();
    };

    rotateTimer = event => {
        event.stopPropagation();
        this.setState(prevState => ({
            currentAngle: (prevState.currentAngle + 90) % 360,
        }));
    };

    startTimer = () => {
        if (this.intervalId) {
            return;
        }

        const { value } = this.state;

        if (value > 0 && !this.props.isPaused) {
            this.intervalId = setInterval(() => {
                this.setState(
                    prevState => ({ value: prevState.value - 1 }),
                    () => {
                        if (this.state.value === 0) {
                            clearInterval(this.intervalId);
                        }
                    }
                );
            }, 1000);
        }
    };

    clearInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    componentWillUnmount() {
        this.clearInterval();
    }

    isActive = () => {
        const { active } = this.props;
        return active === this.timerId;
    };

    checkIfActive = () => {
        if (this.isActive() && !this.props.isPaused) {
            this.startTimer();
            return;
        }

        this.clearInterval();
    };

    static getDerivedStateFromProps = ({ initialValue }, { initialValue: prevInitialValue }) => {
        return initialValue !== prevInitialValue ? { initialValue, value: initialValue } : null;
    };

    render() {
        const { value, currentAngle } = this.state;
        const { className } = this.props;

        this.checkIfActive();

        const classes = classnames(css.timer, className, {
            [css['timer--active']]: this.isActive(),
        });

        return (
            <button onClick={this.handleButtonClick} className={classes}>
                <div className={css.time} style={{ transform: `rotate(${currentAngle}deg)` }}>
                    {formatTime(value)}
                </div>
                <span className={css.rotationIcon} onClick={this.rotateTimer}>
                    <RotationIcon size={25} />
                </span>
            </button>
        );
    }
}

Timer.propTypes = {
    initialValue: PropTypes.number.isRequired,
    onTimerClick: PropTypes.func.isRequired,
    isPaused: PropTypes.bool.isRequired,
    active: PropTypes.number,
    className: PropTypes.string,
};

Timer.defaultProps = {
    active: null,
    className: '',
};

export default Timer;
