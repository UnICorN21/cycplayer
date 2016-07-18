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
    };
    static defaultProps = {
        width: 600,
        height: 600,
    }
    render() {
        return (
            <div className="cover" style={ {width: this.props.width, height: this.props.height} }>

            </div>
        );
    }
}


