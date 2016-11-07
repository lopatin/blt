import {Component} from 'react';
import {createEagerFactory} from 'recompose';
import {System} from 'core/solver';

export default systemFn => c => {
  const factory = createEagerFactory(c);
  return class extends Component {
    // On mount, we construct the initial system. It consists of a map of serialized
    // constraint templates to an array of local consts for the template.
    componentWillMount() {
      this._system = new System(systemFn(this.props));
      this._system.solver.solve();
    }

    // On every new set of props we parse all of the given constraints again and compare
    // to the existing system. If a template is missing, we add a new constraint. If a
    // template is extaneous we remove it. And if a template is present, the constants
    // are updated as edit vars.
    componentWillReceiveProps(nextProps) {
      this._system.updateConstraints(systemFn(nextProps));
    }

    render() {
      return factory({
        ...this.props,
        ...this._system.solution()
      });
    }
  };
};
