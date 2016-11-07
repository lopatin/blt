import React from 'react';
import ReactDOM from 'react-dom';
import Frame from 'react-frame-component';
import {compose, withProps, withState, withReducer, createEagerFactory, componentFromProp} from 'recompose';

import Compiler from 'core/compiler';
import Solver from 'decorators/solver';
import Measured from 'decorators/measured';
import If from 'decorators/if';

import Sandbox from 'components/sandbox';

const Toolbar = Measured('node', 'onMeasure')(componentFromProp('component'));

export default compose(
  Compiler,
  withProps(({compiled}) => ({
    Block: compiled.get('standard.Block')
  })),
  withProps(({Block}) => ({
    ProjectBar: createEagerFactory(Block),
    PropertiesBar: createEagerFactory(Block)
  })),
  withReducer('projectBarNode', 'projectBarRefFn', (state, ref) => ref ? ReactDOM.findDOMNode(ref) : null),
  withReducer('propertiesBarNode', 'propertiesBarRefFn', (state, ref) => ref ? ReactDOM.findDOMNode(ref) : null),
  withReducer('projectBarMeasures', 'newProjectBarMeasures',
    (state, measures) => (state && measures) ? state.merge(measures) : measures, null),
  withReducer('propertiesBarMeasures', 'newPropertiesBarMeasures',
    (state, measures) => (state && measures) ? state.merge(measures) : measures, null),
  withReducer('sandboxMeasures', 'newSandboxMeasures',
    (state, measures) => (state && measures) ? state.merge(measures) : measures, null),
  withReducer('measures', 'onMeasure',
    (state, measures) => (state && measures) ? state.merge(measures) : measures, null),
  withState('bltRef', 'refFn', null),
  Measured('bltRef', 'onMeasure'),
  If(props => props.projectBarMeasures && props.propertiesBarMeasures && props.measures,
    Solver(({measures, projectBarMeasures, propertiesBarMeasures}) => [
      `project_bar_x = 0`,
      `project_bar_y = 0`,
      `project_bar_width = 200`,
      `project_bar_height = ${measures.height}`,

      `!! sandbox_x = 0`,
      `sandbox_y = 0`,
      `!! sandbox_width = ${measures.width}`,
      `sandbox_height = ${measures.height}`,

      `sandbox_x >= project_bar_x + project_bar_width`,
      `sandbox_width + sandbox_x <= properties_bar_x`,

      `properties_bar_x = ${measures.width} - 200`,
      `properties_bar_y = 0`,
      `properties_bar_width = 200`,
      `properties_bar_height = ${measures.height}`,
    ])),
  withState('componentPath', 'setComponentPath', 'standard.TreeView'),
  loadStyle('standard.BLTStyle')
)(({
    componentPath, setComponentPath, compiled, ProjectBar, PropertiesBar, refFn,
    newProjectBarMeasures, newPropertiesBarMeasures, newSandboxMeasures, onMeasure,
    project_bar_x, project_bar_y, project_bar_width, project_bar_height,
    properties_bar_x, properties_bar_y, properties_bar_width, properties_bar_height,
    sandbox_x, sandbox_y, sandbox_width, sandbox_height,
    projectBarNode, propertiesBarNode, projectBarRefFn, propertiesBarRefFn,
    setAdditionalWidth, additionalWidth, style
  }) => {
  return (
    <Block ref={refFn} style={style || {}}>
      <Toolbar
        component={ProjectBar}
        node={projectBarNode}
        onMeasure={newProjectBarMeasures}
        ref={projectBarRefFn}
        style={{
          position: 'absolute',
          top: project_bar_y,
          left: project_bar_x,
          height: project_bar_height,
          width: project_bar_width
        }}
      />
      <Toolbar
        component={PropertiesBar}
        node={propertiesBarNode}
        ref={propertiesBarRefFn}
        onMeasure={newPropertiesBarMeasures}
        style={{
          position: 'absolute',
          top: properties_bar_y,
          left: properties_bar_x,
          height: properties_bar_height,
          width: properties_bar_width
        }}
      />
      <Sandbox
        Component={compiled.get(componentPath)}
        setComponentPath={setComponentPath}
        style={{
          position: 'absolute',
          top: sandbox_y,
          left: sandbox_x,
          height: sandbox_height,
          width: sandbox_width
        }}
      />
    </div>
  );
});
