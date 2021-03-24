import React from 'react';

class Test extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	componentDidMount() {
		console.log(this.props)
	}

	render() {
		return (<div>{this.props.speak}</div>)
	}
}

export default Test;