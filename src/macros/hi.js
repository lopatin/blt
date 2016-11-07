#lang "sweet.js"

syntax component = function(ctx) {
  let ident = ctx.next().value;
  let rest = ctx.next().value;
  const Component = React.Component;
  return #`class ${ident} extends Component ${rest}`;
};

export default component Hi {
  render() {
    return React.createElement('div', {}, 'yooo');
  }
}
