import React from 'react';
import FilterComponent from '../Components/DigitalCups/FilterComponent';

class DigitalCups extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {

        };
    }

    loadCups = () => {

    }

    render() {
        const t = this.props.t;
        return (
            <React.Fragment>
                <div className="wrapper-main">
                    <FilterComponent
                        t={t}
                        user={this.props.user}
                        loadCups={this.loadCups}
                    />
                </div>
            </React.Fragment>
        );
    }
};

export default DigitalCups;