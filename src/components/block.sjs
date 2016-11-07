component Block {
  render() {
	let props = {};
	for (let key in this.props) {
	  if (key !== 'children') {
	    props[key] = this.props[key];
	  }
	}
    return React.createElement('div', props, this.props.children);
  }
}
