import React from 'react';
import { Nav } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import ReactSelect from 'react-select';
import { formatNumber } from '../../../Utils/Requests';
import _ from 'lodash';

const helpers = {
    getTextTranslations(props) {
        if (props.type === 'Scrap') {
            return {
                setupScrapText: props.t('Setup Scrap'),
                scrapCountText: props.t('Scrap Count'),
                scraptCodeText: props.t('Scrap Code'),
                scrapDefinitionText: props.t('Scrap Definition'),
                scrapLevelText: props.t('Level'),
                responsibleText: props.t('Responsible')
            };
        } else {
            return {
                timeText: props.t('Time'),
                timeLostCodeText: props.t('Time Lost Code'),
                reasonText: props.t('Reason'),
                responsibleText: props.t('Responsible')

            };
        }
    },
    getHeader(text) {
        return <span className={'wordwrap left-align'} style={{ float: 'left' }} data-tip={text}><b>{text}</b></span>
    },
    renderCell(row, prop) {
        if (!this.state.editReason || row.dtdata_id !== this.state.currentReason.dtdata_id) {
            return <span className={'wordwrap left-align'}>{row[prop]}</span>
        } else {
            if (prop === 'quantity' || prop === 'dtminutes') {
                return <input type='number' autoFocus={this.state.editReason}
                    min='1' max={formatNumber(this.state.base) + formatNumber(this.state.currentReason[prop])} value={this.state.newReason[prop]}
                    onChange={(e) => this.changeInputValue(e, prop)}></input>
            } else if (prop === 'dtreason_code') {
                return <ReactSelect
                    maxMenuHeight={100}
                    value={_.find(this.state.allReasonOptions, { dtreason_id: this.state.newReason.dtreason_id })}
                    onChange={(e) => this.changeSelectTable(e)}
                    options={
                        _.filter((
                            this.state.type === 'Scrap' ? (this.state.newReason.level === 'Setup' ? this.state.setupReasonsOptions : this.state.productionReasonsOptions) :
                                this.state.allReasonOptions), (reason) => {
                                    let reasonFound = _.find(this.state.dxhdataList, { dtreason_id: reason.dtreason_id });
                                    return !reasonFound || (reasonFound.dtreason_id === this.state.currentReason.dtreason_id);
                                })}
                />
            } else if (prop === 'level') {
                return <ReactSelect
                    maxMenuHeight={100}
                    value={{ value: this.state.newReason[prop], label: this.state.newReason[prop] }}
                    onChange={(e) => this.changeSelectLevel(e)}
                    options={this.state.levelOptions}
                />
            } else if (prop === 'responsible') {
                let assetOption = _.find(this.state.responsibleOptions, { asset_code: this.state.newReason[prop] });
                return <ReactSelect
                    maxMenuHeight={100}
                    value={assetOption}
                    onChange={(e) => this.changeSelectGenericProp(e, 'responsible')}
                    options={this.state.responsibleOptions}
                />
            } else {
                return <span className={'wordwrap left-align'}>{this.state.newReason[prop]}</span>
            }
        }
    },
    changeInputValue(e, prop) {
        if (formatNumber(this.state.base) + formatNumber(this.state.currentReason[prop]) >= parseInt(e.target.value)) {
            let newReason = this.state.newReason;
            newReason[prop] = parseInt(e.target.value);
            this.setState({ newReason });
        }
    },
    changeSelectLevel(e) {
        let newReason = this.state.newReason;
        const currentLevel = this.state.currentReason.level;
        const newLevel = e.value;
        newReason.dtreason_category = currentLevel === newLevel ? this.state.currentReason.dtreason_category : '';
        newReason.dtreason_id = currentLevel === newLevel ? this.state.currentReason.dtreason_id : '';
        newReason.dtreason_code = currentLevel === newLevel ? this.state.currentReason.dtreason_code : '';
        newReason.dtreason_name = currentLevel === newLevel ? this.state.currentReason.dtreason_name : '';
        newReason.level = newLevel;
        this.setState({
            newReason
        });
    },
    changeSelectTable(e) {
        let newReason = this.state.newReason;
        newReason.dtreason_category = e.dtreason_category;
        newReason.dtreason_code = e.dtreason_code;
        newReason.dtreason_id = e.dtreason_id;
        newReason.dtreason_name = e.dtreason_name;
        newReason.level = e.level;
        this.setState({ newReason });
    },
    changeSelectGenericProp(e, prop) {
        let newReason = this.state.newReason;
        newReason[prop] = e.asset_code;
        this.setState({
            newReason
        });
    },
    editReasonRow(row) {
        this.setState({
            editReason: true,
            currentReason: _.clone(row),
            newReason: _.clone(row)
        });
    },
    cancelEditReason() {
        this.setState({
            editReason: false,
            currentReason: {},
            newReason: {}
        });
    },
    renderEditAcceptDeleteButton(row, action) {
        if (action === 'edit') {
            return <Nav.Link onClick={() => this.editReasonRow(row)}><FontAwesome name='edit' /></Nav.Link>;
        } else if (action === 'accept' && row.dtdata_id === this.state.currentReason.dtdata_id) {
            return <Nav.Link onClick={() => this.props.acceptNewReason(row, this.state.newReason)}><FontAwesome name='check' /></Nav.Link>;
        } else if (action === 'cancel' && row.dtdata_id === this.state.currentReason.dtdata_id) {
            return <Nav.Link onClick={() => this.cancelEditReason()}><FontAwesome name='window-close' /></Nav.Link>;
        } else {
            return <span></span>;
        }
    },
    getHeaders() {
        let columns = [];
        if (this.state.type === 'Scrap') {
            columns = [
                {
                    Header: this.getHeader(this.state.scrapCountText),
                    accessor: 'quantity',
                    style: {
                        overflow: this.state.editReason ? 'visible' : 'hidden'
                    },
                    maxWidth: 256,
                    Cell: c => this.renderCell(c.original, 'quantity')
                },
                {
                    Header: this.getHeader(this.state.scraptCodeText),
                    accessor: 'dtreason_code',
                    style: {
                        overflow: this.state.editReason ? 'visible' : 'hidden'
                    },
                    maxWidth: 256,
                    Cell: c => this.renderCell(c.original, 'dtreason_code')
                },
                {
                    Header: this.getHeader(this.state.scrapDefinitionText),
                    accessor: 'dtreason_name',
                    maxWidth: 256,
                    Cell: c => this.renderCell(c.original, 'dtreason_name')
                },
                {
                    Header: this.getHeader(this.state.scrapLevelText),
                    accessor: 'level',
                    style: {
                        overflow: this.state.editReason ? 'visible' : 'hidden'
                    },
                    maxWidth: 256,
                    Cell: c => this.renderCell(c.original, 'level')
                }
            ];
        } else {
            columns = [
                {
                    Header: this.getHeader(this.state.timeText),
                    accessor: 'dtminutes',
                    maxWidth: 127,
                    Cell: c => this.renderCell(c.original, 'dtminutes')
                },
                {
                    Header: this.getHeader(this.state.timeLostCodeText),
                    accessor: 'dtreason_code',
                    style: {
                        overflow: this.state.editReason ? 'visible' : 'hidden'
                    },
                    maxWidth: 256,
                    Cell: c => this.renderCell(c.original, 'dtreason_code')
                },
                {
                    Header: this.getHeader(this.state.reasonText),
                    accessor: 'dtreason_name',
                    maxWidth: 514,
                    Cell: c => this.renderCell(c.original, 'dtreason_name')
                }
            ];
        }

        columns.push(
            {
                Header: this.getHeader(this.state.responsibleText),
                accessor: 'responsible',
                style: {
                    overflow: this.state.editReason ? 'visible' : 'hidden'
                },
                maxWidth: 514,
                Cell: c => this.renderCell(c.original, 'responsible')
            }
        )

        if (this.state.editReason) {
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'accept')
                }
            );
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'cancel')
                }
            );
        } else if (this.props.isEditable) {
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'edit')
                }
            );
        }

        return columns;
    }
}

export default helpers;