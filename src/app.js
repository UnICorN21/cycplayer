/**
 * app.jsx
 * Created by Huxley on 7/18/16.
 */
import React from 'react';
import Cover from './cover.jsx';
import SingleSong from './singlesong.jsx';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        // TODO
        this.state = {
            selectedSong: null,
        };
    }
    handleSingleSong(song) {
        this.setState({ selectedSong: song });
    }
    render() {
        let mainElement = (() => {
           if (this.state.selectedSong) return <SingleSong song={this.state.selectedSong}/>;
           else return <Cover singleSongHandler={this.handleSingleSong.bind(this)}/>;
        })();
        return (
            <div className="app">{mainElement}</div>
        );
    }
}
