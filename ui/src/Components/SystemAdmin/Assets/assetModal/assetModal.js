import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AssetActions from '../../../../redux/actions/assetActions';
import { Modal, Container, Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import '../../../../sass/SystemAdmin.scss';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import _ from 'lodash';

class AssetModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            action: props.action,
            asset: {},
            asset2: {},
            step1: true,
            step2: false,
            step3: false,
            step4: false,
            showFooter: _.isEmpty(props.asset) || props.asset.asset_level === 'Cell'
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen && _.isEmpty(prevState.asset)) {
            return {
                asset: nextProps.asset,
                asset2: nextProps.asset,
                step1: true,
                step2: false,
                step3: false,
                step4: false,
                showFooter: _.isEmpty(nextProps.asset) || nextProps.asset.asset_level === 'Cell'
            };
        }
        if (!nextProps.isOpen) {
            return {
                asset: {},
                asset2: {},
                step1: true,
                step2: false,
                step3: false,
                step4: false,
                showFooter: true
            }
        }
        return null;
    }

    updateAssetByCode = (new_asset_code) => {
        const { actions } = this.props;
        const params = {
            site_id: this.props.user.site
        }
        actions.getAssetsFilter(params).then((response) => {
            const asset = _.find(response, { asset_code: new_asset_code });
            this.setState({ asset });
        });
    }

    assetSteps = (step, e) => {
        e.preventDefault();
        switch (step) {
            case 1:
                this.setState({
                    step1: true,
                    step2: false,
                    step3: false,
                    step4: false,
                });
                break;
            case 2:
                this.setState({
                    step1: false,
                    step2: true,
                    step3: false,
                    step4: false,
                });
                break;
            case 3:
                this.setState({
                    step1: false,
                    step2: false,
                    step3: true,
                    step4: false,
                });
                break;
            case 4:
                this.setState({
                    step1: false,
                    step2: false,
                    step3: false,
                    step4: true,
                });
                break;
            default:
                break;
        }
    };

    hideSteps = (showFooter, showConfirm) => {
        this.setState({
            showFooter,
            showConfirm,
        });
    };

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {
        const t = this.props.t;
        return (
            <div>
                <Modal
                    show={this.props.isOpen}
                    onHide={this.props.handleClose}
                    className='asset-modal'
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{t(this.props.action + ' Asset')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.step1 === true && (
                            <Step1
                                nextStep={(e) => this.assetSteps(2, e)}
                                user={this.props.user}
                                asset={this.state.asset}
                                asset2={this.state.asset2}
                                action={this.props.action}
                                showFooter={this.hideSteps}
                                updateAssetByCode={this.updateAssetByCode}
                                handleClose={this.props.handleClose}
                                Refresh={this.props.Refresh}
                                t={t}
                            />
                        )}
                        {this.state.step2 === true && (
                            <Step2
                                nextStep={(e) => this.assetSteps(3, e)}
                                back={(e) => this.assetSteps(1, e)}
                                user={this.props.user}
                                asset={this.state.asset}
                                asset2={this.state.asset2}
                                action={this.props.action}
                                t={t}
                            />
                        )}
                        {this.state.step3 === true && (
                            <Step3
                                user={this.props.user}
                                nextStep={(e) => this.assetSteps(4, e)}
                                back={(e) => this.assetSteps(2, e)}
                                asset={this.state.asset}
                                asset2={this.state.asset2}
                                action={this.props.action}
                                t={t}
                            />
                        )}
                        {this.state.step4 === true && (
                            <Step4
                                user={this.props.user}
                                back={(e) => this.assetSteps(3, e)}
                                asset={this.state.asset}
                                asset2={this.state.asset2}
                                action={this.props.action}
                                t={t}
                            />
                        )}
                    </Modal.Body>
                    {this.state.showFooter === true && (
                        <Modal.Footer>
                            <Container>
                                <Row className='barStepsAsset'>
                                    <Col md={3} className={this.state.step1 ? 'active' : ''}>
                                        <Row>
                                            <Col md={1}>
                                                <p className='numberPart'>1</p>
                                            </Col>
                                            <Col md={7}>
                                                <p>{t('Step')} 1</p>
                                                <p>{t('Define Asset')}</p>
                                            </Col>
                                            <Col md={2}>
                                                <FontAwesome name="chevron-right fa-3x" />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={3} className={this.state.step2 ? 'active' : ''}>
                                        <Row>
                                            <Col md={1}>
                                                <p className='numberPart'>2</p>
                                            </Col>
                                            <Col md={7}>
                                                <p>{t('Step')} 2</p>
                                                <p>{t('Define Tag')}</p>
                                            </Col>
                                            <Col md={2}>
                                                <FontAwesome name="chevron-right fa-3x" />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={3} className={this.state.step3 ? 'active' : ''}>
                                        <Row>
                                            <Col md={1}>
                                                <p className='numberPart'>3</p>
                                            </Col>
                                            <Col md={7}>
                                                <p>{t('Step')} 3</p>
                                                <p>{t('Assign Reason')}</p>
                                            </Col>
                                            <Col md={2}>
                                                <FontAwesome name="chevron-right fa-3x" />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md={3} className={this.state.step4 ? 'active' : ''}>
                                        <Row>
                                            <Col md={1}>
                                                <p className='numberPart'>4</p>
                                            </Col>
                                            <Col md={7}>
                                                <p>{t('Step')} 4</p>
                                                <p>{t('Assign Break')}</p>
                                            </Col>
                                            <Col md={2}>
                                                <FontAwesome name="chevron-right fa-3x" />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Container>
                        </Modal.Footer>
                    )}
                </Modal>
            </div>
        );
    }
}

export const mapDispatch = (dispatch) => {
    return {
        actions: bindActionCreators(AssetActions, dispatch),
    };
};

export default connect(null, mapDispatch)(AssetModal);