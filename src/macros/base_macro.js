#lang "sweet.js"

import Hi from './hi.js';
// import withEnv from './env.js' for runtime;

syntax runtime = ctx => {
  let ident = ctx.next().value;
  let rest = ctx.next().value;
  return #`((React) => #\`${rest}\`)(...${ident})`;
};

(function gethi(...envs) {
  return runtime envs Hi;
})