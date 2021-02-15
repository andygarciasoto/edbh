import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import ReactSelect from 'react-select';
import { API } from '../../Utils/Constants';
import {
    getResponseFromGeneric
} from '../../Utils/Requests';
import * as _ from 'lodash';
import MessageModal from '../Common/MessageModal';

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
                { label: 'Value Stream', value: 'value_stream' },
                { label: 'Workcell', value: 'workcell_name' }
            ],
            assets_list: [],
            asset_list_option: [],
            asset_selected_option: {},
            modal_message_IsOpen: false,
            modal_type: '',
            modal_message: ''
        };
    }

    async componentDidMount() {
        const asset = {
            site: this.props.user.site,
            level: 'All',
            automation_level: 'All'
        };
        let assets_list = await getResponseFromGeneric('get', API, '/machine', {}, asset, {}) || [];
        _.forEach(assets_list, asset => {
            asset.label = asset.asset_code + ' - ' + asset.asset_code;
            asset.value = asset.asset_id;
            if (asset.asset_level !== 'Site' && asset.asset_level !== 'Area') {
                asset.target = Math.floor(Math.random() * 55) + 1;
                asset.actual = Math.floor(Math.random() * 55) + 1;
                asset.backgroundColor = asset.actual >= asset.target ? 'green' : 'red';
                asset.previousHours = new Array(5);
                asset.redCount = 0;
                _.forEach(asset.previousHours, (value, index) => {
                    asset.previousHours[index] = (Math.floor(Math.random() * 2) + 1) === 1 ? 'green' : 'red';
                    asset.redCount += (asset.previousHours[index] === 'red') ? 1 : 0;
                });
                asset.escalation = asset.backgroundColor === 'red' && asset.previousHours[4] === 'red' && asset.previousHours[3] === 'red';
            }
        });
        this.setState({ assets_list });
    }

    onChangeSelectLevel = (e, field) => {
        let asset_list_option = e.value === 'Site' ? [] :
            (e.value === 'Area' ? _.filter(this.state.assets_list, { asset_level: e.value }) :
                _.filter(this.state.assets_list, asset => { return asset.asset_level === 'Cell' && !_.isEmpty(asset[e.value]); }));
        if (e.value !== 'Site' && e.value !== 'Area' && !_.isEmpty(asset_list_option)) {
            asset_list_option = _.orderBy(_.map(_.uniqBy(asset_list_option, e.value), asset => {
                asset.value = asset[e.value];
                asset.label = asset[e.value];
                return asset;
            }), 'value');
        }
        this.setState({
            [field]: e,
            asset_list_option,
            asset_selected_option: {}
        });
    }

    onChangeSelect = (e, field) => {
        this.setState({
            [field]: e
        });
    }

    searchData = () => {
        if (!_.isEmpty(this.state.selectedLevel)) {
            if (this.state.selectedLevel.value !== 'Site' && _.isEmpty(this.state.asset_selected_option)) {
                this.setState({
                    modal_message_IsOpen: true,
                    modal_type: 'Error',
                    modal_message: 'Please select ' + this.state.selectedLevel.value + ' to filter'
                });
            } else {
                this.props.loadCups(this.state.selectedLevel, this.state.asset_selected_option, this.state.assets_list);
            }
        } else {
            this.setState({ modal_message_IsOpen: true, modal_type: 'Error', modal_message: 'Please select a Level to filter' });
        }
    }

    closeModal = () => {
        this.setState({ modal_message_IsOpen: false });
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
                <Row className='filterDiv'>
                    <Col md={2} lg={2}>{t('Visualization Level') + ':'}
                        <ReactSelect
                            value={this.state.selectedLevel}
                            onChange={(e) => this.onChangeSelectLevel(e, 'selectedLevel')}
                            options={this.state.levelOptions}
                            className={"react-select-container"}
                            styles={selectStyles}
                        />
                    </Col>
                    {this.state.selectedLevel.value !== 'Site' && !_.isEmpty(this.state.selectedLevel) ?
                        <Col md={2} lg={2}>{t('Select ' + this.state.selectedLevel.label) + ':'}
                            <ReactSelect
                                value={this.state.asset_selected_option}
                                onChange={(e) => this.onChangeSelect(e, 'asset_selected_option')}
                                options={this.state.asset_list_option}
                                className={"react-select-container"}
                                styles={selectStyles}
                            />
                        </Col>
                        : null}
                    <Col md={2} lg={2} className='buttonFilter'>
                        <Button variant='outline-primary' onClick={this.searchData}>{t('Submit')}</Button>
                    </Col>
                </Row>
                <MessageModal
                    isOpen={this.state.modal_message_IsOpen}
                    onRequestClose={this.closeModal}
                    type={this.state.modal_type}
                    message={this.state.modal_message}
                    t={this.props.t}
                />
            </React.Fragment>
        );
    }
};

export default FilterComponent;