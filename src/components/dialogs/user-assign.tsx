import React from "react";
import Button from "react-bootstrap/Button";
import {Modal} from "react-bootstrap";
import {TableModel} from "../../models/table.model";

interface IRecipeProps {
    selectedTable?: TableModel | null | undefined;
    shown?: boolean;
    output?: any;
}

interface IRecipeState {
}

export default class UserAssign extends React.Component<IRecipeProps, IRecipeState> {

    handleClose = () => {
        this.props.output();
    };

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
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.handleClose()}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => this.handleClose()}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}
