/**
 * app.jsx
 * Created by Huxley on 7/18/16.
 */
import React from 'react';
import BrowserRouter from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Cover from './cover.jsx';
import SingleSong from './singlesong.jsx';

export default class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div style={{ width: '100%', height: '100%' }}>
                    <Match pattern="/" exactly component={Cover}/>
                    <Match pattern="/song/:songId" component={SingleSong}/>
                </div>
            </BrowserRouter>
        );
    }
}
