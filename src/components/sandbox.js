import React, {Component} from 'react';
import {compose, withProps, pure, createEagerElement} from 'recompose';
import Frame from 'react-frame-component';
import Compiler from 'core/compiler';

const cmp = compose(pure, Compiler)(props => createEagerElement(props.Component));

export default compose(
)(({style}) => (
  <Frame className='Sandbox' style={style}>
    <cmp />
  </Frame>
));
