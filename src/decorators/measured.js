import {compose, setPropTypes, branch, lifecycle} from 'recompose';
import ResizeDetector from 'element-resize-detector';
import Measures from 'records/measures';
import Watch from 'decorators/watch';
import WithRecord from 'decorators/with_record';

/**
 * Measured should invoke the onMeasure callback when internal representation
 * of measurements changes.
 */
export default (nodeProp, onMeasureProp) => compose(
  // withProps(props => ({
  //   node: props[nodeProp],
  //   onMeasure: props[onMeasureProp]
  // })),

  // Initially not measured.
  // WithRecord('measures', null),

  // Callback is invoked when there is new measurement info.
  // watch('measures', onMeasureProp),

  lifecycle({
    componentWillMount() {
      this.detector = ResizeDetector({strategy: 'scroll'});

      // Bind the resize callback to new props when we get them here and in willReceiveProps
      this.updateResizeCb = onMeasure => {
        this.resizeCb = () => {
          let rect = this.measuredNode.getBoundingClientRect();
          onMeasure(new Measures({
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            scrollTop: this.measuredNode.scrollTop,
            scrollHeight: this.measuredNode.scrollHeight
          }));
        };
      };
      this.updateResizeCb(this.props[onMeasureProp]);

      // Make sure that this.measuredNode is up to date with the node. Manage the
      // resize detector callbacks.
      this.updateMeasuredNode = (newNode, onMeasure) => {
        let existingMeasuredNode = this.measuredNode;
        if (existingMeasuredNode !== newNode) {
          if (existingMeasuredNode) {
            // this.detector.removeListener(existingMeasuredNode, this.resizeCb);
            this.detector.uninstall(existingMeasuredNode);
          }
          if (newNode) {
            this.detector.listenTo(newNode, this.resizeCb);
          }
          this.measuredNode = newNode;
        }
      };

      this.updateMeasuredNode(this.props[nodeProp], this.props[onMeasureProp]);
    },

    componentDidMount() {
      this.updateMeasuredNode(this.props[nodeProp]);
      if (this.measuredNode) {
        this.resizeCb();
      }
    },

    componentWillReceiveProps(nextProps) {
      this.updateMeasuredNode(nextProps[nodeProp]);
      this.updateResizeCb(nextProps[onMeasureProp]);
    },

    componentDidUpdate(prevProps, prevState) {
      this.updateMeasuredNode(this.props[nodeProp]);
      if (this.measuredNode && prevProps[nodeProp] !== this.props[nodeProp]) {
        this.resizeCb();
      }
    },

    componentWillUnmount() {
      if (this.measuredNode) {
        this.detector.uninstall(this.measuredNode);
      }
    }
  })
);