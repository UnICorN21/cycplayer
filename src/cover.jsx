/**
 * cover.jsx
 * Created by Huxley on 7/18/16.
 */
import React from 'react';
require('./cover.scss');

export default class Cover extends React.Component {
    static propTypes = {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        singleSongHandler: React.PropTypes.func,
    };
    static defaultProps = {
        width: 600,
        height: 600,
        singleSongHandler: Cover.handleMusicSelectStub,
    };
    constructor(props) {
        super(props);
        this.searchHelper = { handler: null, last: '' };
        this.state = {
            inputing: false,
            songs: [
                {
                    name: 'What if we have never met',
                    src: '/data/What If We Had Never Met.m4a',
                    artwork: '/data/What If We Had Never Met.jpg'
                }
            ],
        };
    }
    handleSearchInput() {
        this.setState({ inputing: this.refs.input.value.length !== 0 });
        if (this.state.inputing) this.search(this.refs.input.value.trim());
    }
    search(keyword) {
        const freq = 2;
        let _search = (keyword) => {
            // TODO
            console.log('trigger a search with', keyword);
        };
        if (this.searchHelper.last !== keyword && !this.searchHelper.handler)
            this.searchHelper.handler = setTimeout(() => {
                _search(keyword);
                this.searchHelper.last = keyword;
                this.searchHelper.handler = null;
            }, 1000 / freq);
    }
    static handleMusicSelectStub(song) {
        console.log(song);
    }
    render() {
        return (
            <div className="cover" style={ {width: this.props.width, height: this.props.height} }>
                <input ref="input" className="search-input" autoFocus="true"
                       onInput={this.handleSearchInput.bind(this)}
                       placeholder="Enter the song name here..."
                       style={ {top: this.state.inputing ? '40%' : '50%'} }/>
                <div className="result" style={ {
                    visibility: this.state.inputing ? 'visible' : 'hidden',
                    opacity: this.state.inputing ? 1 : 0,
                } }>
                    <div className="result-wrapper">
                        <div className="loading" style={ {
                            visibility: this.state.songs.length > 0 ? 'hidden' : 'visible',
                            opacity: this.state.songs.length > 0 ? 0 : 1,
                        } }/>
                        <ul className="songs">{this.state.songs.map(song => {
                            return <li key={song.name} onClick={() => {this.props.singleSongHandler(song)}}>{song.name}</li>
                        })}</ul>
                    </div>
                </div>
            </div>
        );
    }
}


