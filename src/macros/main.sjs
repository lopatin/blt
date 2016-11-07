syntax compose = ctx => {
  const block = ctx.next().value;
  let arr = [];
  for (let item of block.inner()) {
    arr.push(item, #`,`);
  }
  return #`{
    ${arr}
  }`;
};

syntax decorate = ctx => {
  // ctx.next();
  // ctx.expand('expr');
  // ctx.reset();
  const decorator = ctx.expand('Expression').value;
  const cmp = ctx.next().value;
  return #`${decorator}(${cmp})`;
}

syntax proptypes = ctx => {
  ctx.expand('expr');
  ctx.reset();
  const propTypes = ctx.next().value;
  return #``;
}

syntax component = ctx => {
  let name = ctx.next().value;
  let block = ctx.next().value;
  return #`class ${name} extends Component ${block}`;
}
