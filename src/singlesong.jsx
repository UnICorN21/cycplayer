/**
 * singlesong.jsx
 * Created by Huxley on 7/17/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
require('./singlesong.scss');

export default class SingleSong extends React.Component {
    static propTypes = {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
    };
    static defaultProps = {
        width: 1000,
        height: 1000,
    };
    loadSong(songId) { // TODO
        return {
            name: '孟姜女',
            src: '/data/孟姜女.mp3',
            artwork: '/data/孟姜女.jpg'
        };
    }
    constructor(props) {
        super(props);
        const song = this.loadSong(this.props.params['songId']);
        this.state = {
            playing: false,
            progress: 0,
            hasBackground: song.artwork !== undefined && song.artwork.length !== 0,
            song: song,
            canvasLength: Math.min(this.props.width, this.props.height),
            cursorPointLength: 8,
        };

        if (this.state.canvasLength < 250) throw new Error('The component size is too small.');

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftsize = 1024;
    }
    componentDidMount() {
        this.audioDOM = ReactDOM.findDOMNode(this.refs.audio);
        this.audioDOM.crossOrigin = "anonymous";
        this.audioDOM.addEventListener('play', () => { this.setState({playing: true}); });
        this.audioDOM.addEventListener('pause', () => { this.setState({playing: false}); });

        let setProgress = () => {
            this.setState({progress: 100 * this.audioDOM.currentTime / this.audioDOM.duration });
        };
        this.audioDOM.addEventListener('timeupdate', setProgress);
        this.audioDOM.addEventListener('seeked', setProgress);

        var source = this.audioCtx.createMediaElementSource(this.audioDOM);
        source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.timeBuff = new Uint8Array(this.analyser.frequencyBinCount);
        this.freqBuff = new Uint8Array(this.analyser.frequencyBinCount);

        var canvasDOM = ReactDOM.findDOMNode(this.refs.canvas);
        this.canvasCtx = canvasDOM.getContext('2d');
        this.animate();
    }
    control() {
        this.setState({ playing: !this.state.playing });
        setTimeout(() => {
            if (this.state.playing) this.audioDOM.play();
            else this.audioDOM.pause();
        }, 0);
    }
    seekAudio(event) {
        let offset = event.pageX - this.refs.progressbar.getBoundingClientRect().left,
            total = this.state.canvasLength - 250;
        this.audioDOM.currentTime = this.audioDOM.duration * offset / total;
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
        var mean = 0;
        requestAnimationFrame(this.animate.bind(this));
        for (var i = 0; i < this.analyser.frequencyBinCount; i += 3) {
            if (this.state.playing) mean += this.freqBuff[i];
            let theta = i * Math.PI / (this.analyser.frequencyBinCount),
                inside = this.state.progress > 1 ? (this.timeBuff[i] - 128) * radius / 128 : -1,
                outside = this.state.progress > 1 ? (this.freqBuff[i] - 100) * radius / 256 : 0;
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
        this.setState({ cursorPointLength: 8 + 20 * 3 * mean / (255 * this.analyser.frequencyBinCount) });
    }
    render() {
        let artworkStyle = {
            background: this.state.hasBackground ? `url('${this.state.song.artwork}')` : 'black',
            backgroundSize: '100%',
            position: 'absolute',
            width: this.state.canvasLength - 200,
            height: this.state.canvasLength - 200,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            animation: this.state.playing ? 'revolve 24s linear infinite' : ''
        };
        return (
            <div className="song-wrapper">
                <div className="under-background" style={ {
                    position: 'absolute', width: '100%', height: '100%',
                    background: this.state.hasBackground ? `url('${this.state.song.artwork}')` : 'black',
                    backgroundSize: '100%',
                    zIndex: 1 } }></div>
                <div className="background" style={ {
                    position: 'absolute', width: '100%', height: '100%',
                    background: 'rgba(0, 0, 0, 0.9)', zIndex: 10 } }></div>
                <div className="upper" style={{ width: this.props.width, height: this.props.height }}>
                    <div className="artwork" style={artworkStyle}/>
                    <h3 className={this.state.playing ? 'playing' : ''}>{this.state.song.name}</h3>
                    <div className="progress-bar" style={ {width: this.state.canvasLength - 250} }>
                        <div className="progress-bar-wrapper" ref="progressbar"
                            onClick={this.seekAudio.bind(this)}>
                        <hr className="timeline" style={ {width: this.state.canvasLength - 250} }/>
                        <div className={`cursor-border ${this.state.playing ? 'playing' : ''}`} style={ {left: `${this.state.progress}%`} }/>
                        <div className="cursor-point" style={ {
                        left: `${this.state.progress}%`,
                        width: this.state.cursorPointLength,
                        height: this.state.cursorPointLength,
                        } }/>
                        </div>
                    </div>
                    <div className="control-btn" onClick={this.control.bind(this)}>
                        <div className={`play-btn ${this.state.playing ? '' : 'onshow'}`}/>
                        <div className={`pause-btn ${this.state.playing ? 'onshow': ''}`}>
                            <div className="left"/>
                            <div className="right"/>
                        </div>
                    </div>
                    <audio ref="audio" src={this.state.song.src} autoPlay="true"/>
                    <canvas ref="canvas" width={this.state.canvasLength} height={this.state.canvasLength}/>
                </div>
            </div>
        );
    }
}
