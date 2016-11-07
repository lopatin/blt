import React, {Component} from 'react';
import {compose, withProps} from 'recompose';
import Frame from 'react-frame-component';
import Compiler from 'core/compiler';

export default compose(
  withProps(props => ({Comp: Compiler(props.Component)}))
)(({Comp, style}) => (
  <Frame className='Sandbox' style={style}>
    <Comp>
      treeview?
    </Comp>
  </Frame>
));
