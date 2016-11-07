// /**
//  * Communicate with outside systems with this helper. Watch the value at the prop name.
//  * Also accepts a function that returns a value given props. Also invokes on mount.
//  */
// export default (watched, callback) =>
//   lifecycle({
//     componentDidMount() {
//       (R.type(callback) === 'String' ? this.props[callback] : callback)(val, initial);
//     },

//     componentDidUpdate(prevProps, prevState) {
//       let newval = resolveNameOrFunc(this.props, watched);
//       let prevval = resolveNameOrFunc(prevProps, watched);
//       if (prevval !== newval) {
//         (R.type(callback) === 'String' ? this.props[callback] : callback)(newval, prevval);
//       }
//     }
//   });
