import {branch, compose} from 'recompose';
export default (condition, ...hocs) => branch(condition, compose(...hocs), x => x);
