/**
 * main.js
 * Created by Huxley on 7/17/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import SingleSong from './singlesong.jsx';

var song = {
    name: 'ninelie',
    src: '../data/ninelie.mp3',
    artwork: '../data/ninelie.jpg'
};

var container = document.getElementById('container');
ReactDOM.render(<SingleSong song={song}/>, container);
