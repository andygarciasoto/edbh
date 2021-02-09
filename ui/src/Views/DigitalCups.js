import React from 'react';
import CupsContainer from '../Components/DigitalCups/CupsContainer';
import FilterComponent from '../Components/DigitalCups/FilterComponent';

class DigitalCups extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            levelSelection: {},
            assetSelection: {},
            assetList: []
        };
    }

    loadCups = (levelSelection, assetSelection, assetList) => {
        this.setState({ levelSelection, assetSelection, assetList });
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
                    <CupsContainer
                        t={t}
                        user={this.props.user}
                        levelSelection={this.state.levelSelection}
                        assetSelection={this.state.assetSelection}
                        assetList={this.state.assetList}
                    />
                </div>
            </React.Fragment>
        );
    }
};

export default DigitalCups;