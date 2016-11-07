#lang 'sweet.js';

export syntax runtime = ctx => {
  let ident = ctx.next().value;
  ctx.next();
  let imprt = ctx.next().value;
  return #`let ${ident} = envs['${imprt}'];`;
  // return #`var hi;`;
}

// export syntax runtime = ctx => {

// };

// export syntax run = ctx => {
//   let block = ctx.next().value;

//   return #`
//     runtime React, 'react'
//     runtime ReactDOM, 'react-dom'

//     (() => ${block})()`;
// };
