/**
 * main.js
 * Created by Huxley on 7/17/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import SingleSong from './singlesong.jsx';
import Cover from './cover.jsx';

var song = {
    name: '夏祭り',
    src: '/data/夏祭り.mp3',
    artwork: '/data/夏祭り.jpg'
};

var container = document.getElementById('container');
ReactDOM.render(<Cover/>, container);
