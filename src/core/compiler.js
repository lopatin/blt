import React from 'react';
import ReactDOM from 'react-dom';
import Frame from 'react-frame-component';
import * as Recompose from 'recompose';
import I from 'immutable';
import {parse, compile} from 'sweet.js';
import {transform} from 'babel-standalone';

import {Source, updateSourceSet} from './sources';

import mainTmpl from 'raw!macros/main.sjs';
import blockTmpl from 'raw!components/block.sjs';
import treeViewTmpl from 'raw!components/tree_view.sjs';

const {withProps, withReducer, mapProps, compose} = Recompose;

let internalSources = new I.Map();
internalSources = updateSourceSet(internalSources,
  'standard.Block'.split('.'),
  new Source({
    path: 'standard.Block',
    type: 'component',
    content: blockTmpl
  }));
internalSources = updateSourceSet(internalSources,
  'standard.TreeView'.split('.'),
  new Source({
    path: 'standard.TreeView',
    type: 'component',
    content: treeViewTmpl
  }));

export default compose(
  // Internal hard-coded sources.
  withProps({internalSources}),

  // An unorganized bag of sources. Children shouldn't have a care in the world, just update
  // the source and let the compiler do magic.
  withReducer('dynamicSources', 'updateSource', updateSourceSet, new I.Map()),

  // Merge the two sets of sources. Dynamic overrides win.
  mapProps(({internalSources, dynamicSources, ...props}) =>
      ({...props, sources: internalSources.merge(dynamicSources)})),

  // Compile and load into memory.
  withProps(({sources}) => {
    // Append all sources together.
    var concatenatedSources = mainTmpl + "\n";
    sources.forEach((val, key) => {
      concatenatedSources += (val.content + "\n");
    });

    // Compile with Sweet.js
    // console.log(concatenatedSources);
    var compiledCode = compile(concatenatedSources, {
      transform: (gen, opts) => {
        // return gen;
        return transform(gen, {presets: ['es2015']});
      },
      cwd: '.',
      moduleLoader: m => ({})[m]
    }).code;

    // Evaluate and we have our in-memory objects and classes.
    let finalCode = `(function(React, ReactDOM, Recompose, Frame) {
      var Component = React.Component;
      var setPropTypes = Recompose.setPropTypes;
      var exp = {};
      ${compiledCode}
      ${sources.map(val => `exp['${val.path}'] = ${val.name()};`).join("\n")}
      return exp;
    })`;

    // console.log(finalCode);

    let evalResult = eval(finalCode)(React, ReactDOM, Recompose, Frame);
    // console.log(evalResult);
    return {
      compiled: new I.Map(evalResult)
    };
  })
);
