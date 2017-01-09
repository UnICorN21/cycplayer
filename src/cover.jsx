/**
 * cover.jsx
 * Created by Huxley on 7/18/16.
 */
import React from 'react';
import Link from 'react-router/Link'
require('./cover.scss');
let Fuse = require('fuse.js/src/fuse.min');

export default class Cover extends React.Component {
    static propTypes = {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
    };
    static defaultProps = {
        width: 30,
        height: 30,
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
                },
                {
                    id: 'tayi',
                    name: '"たいせつなきみのために、ぼくにできるいちばんのこと"',
                    src: '/data/"たいせつなきみのために、ぼくにできるいちばんのこと".mp3',
                    artwork: '/data/"たいせつなきみのために、ぼくにできるいちばんのこと".jpg'
                }
            ],
            searchResults: []
        };
    }
    handleSearchInput() {
        this.setState({ inputing: this.refs.input.value.length !== 0 });
        if (this.state.inputing) this.search(this.refs.input.value.trim());
    }
    search(keyword) {
        const freq = 2;
        let _search = (keyword) => {
            let fuse = new Fuse(this.state.songs, {
                keys: ["name"],
                maxPatternLength: 32,
                minMatchCharLength: 1
            });
            this.setState({ searchResults: fuse.search(keyword) });
        };
        if (this.searchHelper.last !== keyword && !this.searchHelper.handler)
            this.searchHelper.handler = setTimeout(() => {
                _search(keyword);
                this.searchHelper.last = keyword;
                this.searchHelper.handler = null;
            }, 1000 / freq);
    }
    render() {
        let shouldShowResultsPanel = this.state.searchResults.length > 0;
        let resultsDOM = this.state.searchResults.map(song => {
            return (<li key={song.id}><Link to={`/song/${song.id}`}>{song.name}</Link></li>);
        });
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
                            display: shouldShowResultsPanel ? 'none' : 'block',
                            visibility: shouldShowResultsPanel ? 'hidden' : 'visible',
                            opacity: shouldShowResultsPanel ? 0 : 1,
                        } }/>
                        <ul className="songs">{resultsDOM}</ul>
                    </div>
                </div>
            </div>
        );
    }
}


