import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import ReactSelect from 'react-select';

class FilterComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            selectedLevel: {},
            levelOptions: [
                { label: 'Site', value: 'Site' },
                { label: 'Area', value: 'Area' },
                { label: 'Cell', value: 'Cell' }
            ]
        };
    }

    onChangeSelect = (e, field) => {
        this.setState({
            [field]: e
        });
    }

    searchData = () => {
        
    }

    render() {
        const t = this.props.t;
        const selectStyles = {
            control: base => ({
                ...base,
                height: 35,
                minHeight: 35
            })
        };
        return (
            <React.Fragment>
                <Row>
                    <Col md={2} lg={2}>{t('Level Filter') + ':'}
                        <ReactSelect
                            value={this.state.selectedLevel}
                            onChange={(e) => this.onChangeSelect(e, 'selectedLevel')}
                            options={this.state.levelOptions}
                            className={"react-select-container"}
                            styles={selectStyles}
                        />
                    </Col>
                    {this.state.selectedLevel.value === 'Area' ?
                        <Col md={2} lg={2}>{t('Area Filter') + ':'}
                            <ReactSelect
                                value={this.state.selectedArea}
                                onChange={(e) => this.onChangeSelect(e, 'selectedArea')}
                                options={this.state.areaOptions}
                                className={"react-select-container"}
                                styles={selectStyles}
                            />
                        </Col>
                        : null}
                    {this.state.selectedLevel.value === 'Cell' ?
                        <Col md={2} lg={2}>{t('Cell Filter') + ':'}
                            <ReactSelect
                                value={this.state.selectedCell}
                                onChange={(e) => this.onChangeSelect(e, 'selectedCell')}
                                options={this.state.cellOptions}
                                className={"react-select-container"}
                                styles={selectStyles}
                            />
                        </Col>
                        : null}
                    <Col md={2} lg={2}>
                        <Button variant="outline-primary" style={{ marginBottom: '0%' }}
                            onClick={this.searchData}>{t('Submit')}</Button>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
};

export default FilterComponent;