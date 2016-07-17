/**
 * singlesong.jsx
 * Created by Huxley on 7/17/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
require('./singlesong.scss');

export default class SingleSong extends React.Component {
    static propTypes = {
        song: React.PropTypes.object.isRequired, // {name, src, artwork, lyric}
        width: React.PropTypes.number,
        height: React.PropTypes.number,
    };
    static defaultProps = {
        width: 600,
        height: 600,
    };
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            progress: 0,
            hasBackground: this.props.song.artwork !== undefined && this.props.song.artwork.length !== 0,
            canvasLength: Math.min(this.props.width, this.props.height)
        };
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftsize = 1024;
    }
    componentDidMount() {
        this.audioDOM = ReactDOM.findDOMNode(this.refs.audio);
        this.audioDOM.crossOrigin = "anonymous";
        this.audioDOM.addEventListener('play', () => { this.setState({playing: true}); });
        this.audioDOM.addEventListener('pause', () => { this.setState({playing: false}); });
        this.audioDOM.addEventListener('timeupdate', () => {
            this.setState({progress: 100 * this.audioDOM.currentTime / this.audioDOM.duration });
        });

        var source = this.audioCtx.createMediaElementSource(this.audioDOM);
        source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.timeBuff = new Uint8Array(this.analyser.frequencyBinCount);
        this.freqBuff = new Uint8Array(this.analyser.frequencyBinCount);

        var canvasDOM = ReactDOM.findDOMNode(this.refs.canvas);
        this.canvasCtx = canvasDOM.getContext('2d');
        this.animate();
    }
    animate() {
        this.canvasCtx.clearRect(0, 0, this.props.width, this.props.height);

        let centerX = this.state.canvasLength / 2,
            centerY = this.state.canvasLength / 2,
            radius = this.state.canvasLength / 2 - 100;
        if (this.state.playing) {
            this.analyser.getByteFrequencyData(this.freqBuff);
            this.analyser.getByteTimeDomainData(this.timeBuff);
        }
        requestAnimationFrame(this.animate.bind(this));
        for (var i = 0; i < this.analyser.frequencyBinCount; i += 3) {
            let theta = i * Math.PI / (this.analyser.frequencyBinCount),
                inside = this.state.playing ? (this.timeBuff[i] - 128) * radius / 128 : -1,
                outside = this.state.playing ? (this.freqBuff[i] - 100) * radius / 256 : 0;
            this.canvasCtx.save();
            this.canvasCtx.translate(centerX, centerY);
            this.canvasCtx.rotate(Math.PI + theta * (i % 2 ? -1 : 1));
            // time domain, cycles
            if (inside < 0) {
                inside = radius + inside;
                this.canvasCtx.beginPath();
                this.canvasCtx.arc(0, -inside, 1, 0, 2 * Math.PI);
                this.canvasCtx.fillStyle = `rgb(240, ${255 - this.timeBuff[i]}, 45)`;
                this.canvasCtx.fill();
                this.canvasCtx.strokeStyle = `rgb(240, ${255 - this.timeBuff[i]}, 45)`;
                this.canvasCtx.stroke();
            }
            // frequency, oblong
            if (outside > 0) {
                this.canvasCtx.fillStyle = `rgb(220, ${240 - this.freqBuff[i]}, 45)`;
                this.canvasCtx.fillRect(-1, radius, 2, outside);
            }
            this.canvasCtx.filter = 'blur(200px)';
            this.canvasCtx.restore();
        }
    }
    render() {
        var artworkStyle = {
            zIndex: '-1',
            position: 'absolute',
            width: this.props.width,
            height: this.props.height,
            background: this.state.hasBackground ? `url(${this.props.song.artwork})` : 'white',
            backgroundSize: '100%',
        };
        return (
            <div className="song-wrapper">
                <div className="artwork" style={artworkStyle}/>
                <h3>{this.props.song.name}</h3>
                <div className="control-panel" style={ {width: this.state.canvasLength - 250} }>
                    <hr className="timeline" style={ {width: this.state.canvasLength - 250} }/>
                    <div className="cursor-border" style={ {left: `${this.state.progress}%`} }/>
                    <div className="cursor-point" style={ {left: `${this.state.progress}%`} }/>
                </div>
                <audio ref="audio" src={this.props.song.src} autoPlay="true"/>
                <canvas ref="canvas" width={this.state.canvasLength} height={this.state.canvasLength}/>
            </div>
        );
    }
}
