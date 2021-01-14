import React from "react";
import Button from "react-bootstrap/Button";
import {Modal} from "react-bootstrap";
import {TableModel} from "../../models/table.model";
import Form from "react-bootstrap/Form";
import ApiService from "../../services/api.service";

interface IRecipeProps {
    selectedTable?: TableModel | null | undefined;
    shown?: boolean;
    output?: any;
}

interface IRecipeState {
}

export default class UserAssign extends React.Component<IRecipeProps, IRecipeState> {

    state = {
        newUser: ''
    }

    handleClose = () => {
        this.props.output();
    };

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleSave() {
        ApiService.ConnectUserToTable(this.props.selectedTable?.getTableId(), this.state.newUser);
        this.handleClose();
    }

    getTableName = () => {
        let result = '';
        if (this.props.selectedTable !== undefined && this.props.selectedTable !== null) {
            result = this.props.selectedTable.getTableName();
        }
        return result;
    }

    render() {
        return (
            <>
                <Modal show={this.props.shown && this.props.selectedTable !== undefined} onHide={() => this.handleClose()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Assign user to Table({this.getTableName()})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Who do you want to assign to this table?</Modal.Body>
                    <Form.Group>
                        <Form.Control name={'newUser'}
                                      onChange={this.handleChange.bind(this)} type="text"
                                      placeholder="New username"/>
                    </Form.Group>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.handleClose()}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => this.handleSave()}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}
