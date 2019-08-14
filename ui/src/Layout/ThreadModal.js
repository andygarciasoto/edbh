import React from 'react';
import Modal from 'react-modal';
import { Table } from 'react-bootstrap';
import './ThreadModal.scss';
import * as _ from 'lodash';
import Spinner from '../Spinner';
import moment from 'moment';

class ThreadModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            modalStyle: {},
        }
        this.validateBarcode = this.validateBarcode.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    validateBarcode(e) {
        console.log(this.state.value);
    }

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    componentDidMount() {
        const modalStyle = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                maxHeight: '60%',
                overflowY: 'scroll'
            },
            overlay: {
                backgroundColor: 'rgba(0,0,0, 0.6)'
            }
        };

        this.setState({ modalStyle })
    }


    render() {
        const styles = _.cloneDeep(this.state.modalStyle);
        if (!_.isEmpty(styles)) {
            styles.content.width = '70%';
        };
        const t = this.props.t;
        return (
            <Modal
                isOpen={this.props.isOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.props.onRequestClose}
                style={styles}
                contentLabel="Example Modal">
                {(this.props.comments && this.props.comments.length > 0) ? <React.Fragment>
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>{t('User')}</th>
                                <th>{t('Comment')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.comments.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td className={"intershift-info"}><span>{item.entered_by} - {item.first_name}</span><div className={'intershift-date-modal'}>{moment(item.entered_on).format('YYYY-MM-DD')}</div></td>
                                        <td className={"intershift-comment-modal"}><div>{item.comments}</div></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table></React.Fragment> : <Spinner />}
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default ThreadModal;