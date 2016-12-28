/**
 * cover.jsx
 * Created by Huxley on 7/18/16.
 */
import React from 'react';
import Link from 'react-router/Link'
require('./cover.scss');

export default class Cover extends React.Component {
    static propTypes = {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        singleSongHandler: React.PropTypes.func,
    };
    static defaultProps = {
        width: 30,
        height: 30,
        singleSongHandler: Cover.handleMusicSelectStub,
    };
    constructor(props) {
        super(props);
        this.searchHelper = { handler: null, last: '' };
        this.state = {
            inputing: false,
            songs: [
                {
                    id: 'meng1',
                    name: '孟姜女',
                    src: '/data/孟姜女.mp3',
                    artwork: '/data/孟姜女.jpg'
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
            <div className="cover" style={ {width: `${this.props.width}rem`, height: `${this.props.height}rem`} }>
                <input ref="input" className="search-input" autoFocus="true"
                       onInput={this.handleSearchInput.bind(this)}
                       placeholder="Enter the song name here..."
                       style={ {top: this.state.inputing ? '28.6%' : '50%'} }/>
                <div className="result" style={ {
                    visibility: this.state.inputing ? 'visible' : 'hidden',
                    opacity: this.state.inputing ? 1 : 0,
                } }>
                    <div className="result-wrapper">
                        <div className="loading" style={ {
                            display: this.state.songs.length > 0 ? 'none' : 'block',
                            visibility: this.state.songs.length > 0 ? 'hidden' : 'visible',
                            opacity: this.state.songs.length > 0 ? 0 : 1,
                        } }/>
                        <ul className="songs">{this.state.songs.map(song => {
                            return (<li key={song.id}><Link to={`/song/${song.id}`}>{song.name}</Link></li>);
                        })}</ul>
                    </div>
                </div>
            </div>
        );
    }
}


