import React from "react";
import ApiService from "../services/api.service";
import {TableModel} from "../models/table.model";
import styles from "./tables.module.css";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import UserService from "../services/user.service";
import {Redirect} from "react-router-dom";
import {Dropdown} from "react-bootstrap";
import UserAssign from "./dialogs/user-assign";

export default class TablesComponent extends React.Component {

    state = {
        refresh: false,
        redirect: false,
        creationView: false,
        creationId: -1,
        selectedTable: null,
        creationAction: '',
        name: '',
        description: '',
        redirectUrl: '',
        userAssignModalShown: false
    }

    tables: TableModel[] = [];

    async componentDidMount() {
        this.tables = await ApiService.GetTables();
        this.refresh();
    }

    private deleteTable(table: TableModel) {
        const index = this.tables.indexOf(table);
        if (index !== -1) {
            ApiService.DeleteTable(table).then(() => {
                this.tables.splice(index, 1);
                this.refresh();
            });
        }
    }

    private openTable(table: TableModel) {
        this.setState({
            redirectUrl: `table/${table.getTableId()}`,
            redirect: true
        })
    }

    private refresh(): void {
        this.setState({refresh: false});
        this.setState({refresh: true});
    }

    private tableMenu(table: TableModel) {
        return <>
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    *
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => {
                        this.toggleCreationView(true, table.getTableName(), table.getTableDescription(), 'edit', table.getTableId());
                    }}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={
                        () => {
                            this.toggleCreationView(false, '', '','hide', -1);
                            this.toggleAssignUserView(true, table);
                        }
                    }>
                        Assign user
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.deleteTable(table);
                    }}>Delete</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </>;
    }

    private createTableView() {
        let table = [];
        if (this.state.refresh) {
            let view: any[] = [];
            this.tables.forEach(tab => {
                view.push(<Card className={styles.card}>
                    <Card.Body>
                        <Card.Title className={styles.tableTitle}>
                            {tab.getTableName()}
                            {this.tableMenu(tab)}
                        </Card.Title>
                        {tab.getTableDescription()}
                        <div className={styles.btnGroup}>
                            <Button className={styles.btn} onClick={() => {
                                this.openTable(tab);
                            }}>Open</Button>
                        </div>
                    </Card.Body>
                </Card>)
            });
            table.push(view);
        }
        return table;
    }

    private async createTable(name: string, description: string) {
        const response = await ApiService.CreateTable(name, description);
        const table = new TableModel(response.table_id, response.table_name, response.table_description, response.author_id);
        this.tables.push(table);
        this.refresh();
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    private createTableCreationView() {
        if (this.state.creationView && this.state.creationAction === 'create') {
            return (<>
                    <div className={styles.createNewButtonDiv}>
                        <Form.Group>
                            <Form.Control name={'name'} value={this.state.name}
                                          onChange={this.handleChange.bind(this)} type="text"
                                          placeholder="New table name"/>
                            <Form.Control name={'description'} value={this.state.description}
                                          onChange={this.handleChange.bind(this)} type="text"
                                          placeholder="New table description"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button onClick={() => this.createTable(this.state.name, this.state.description)}
                                variant={"success"}>Create</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', '', '', -1)} variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        } else if (this.state.creationView && this.state.creationAction === 'edit') {
            return (<>
                    <div className={styles.createNewButtonDiv}>
                        <Form.Group>
                            <Form.Control name={'name'}
                                          defaultValue={this.state.name}
                                          onChange={this.handleChange.bind(this)} type="text"
                                          placeholder="Edit table name"/>
                            <Form.Control name={'description'} defaultValue={this.state.description}
                                          onChange={this.handleChange.bind(this)} type="text"
                                          placeholder="Edit table description"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button onClick={() => this.editTable(this.state.name, this.state.description, this.state.creationId)}
                                variant={"success"}>Edit</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', '','hide', -1)} variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        }
    }

    private toggleCreationView(status: boolean, name: string, description: string, action: string, id: number) {
        this.setState({
            creationView: status,
            name: name,
            description: description,
            creationAction: action,
            creationId: id
        });
    }

    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to={'/' + this.state.redirectUrl}/>
        }
    }

    render() {
        UserService.subject.subscribe(() => {
            this.setState({
                redirect: true,
            })
        });
        return (<>
            {this.renderRedirect()}
            {this.renderModal()}
            <div className={styles.container}>
                <div className={styles.creationForm}>
                    {this.createTableCreationView()}
                </div>
                <div className={styles.tables}>
                    {this.createTableView()}
                </div>
                <div className={styles.createNewButtonDiv}>
                    <Button onClick={() => this.toggleCreationView(true, '', '', 'create', -1)} className={styles.createNewButton}>
                        Create table
                    </Button>
                </div>
            </div>
        </>);
    }

    private async editTable(name: string, description: string, id: number) {
        await ApiService.EditTable(id, name, description).then(result => {
            if (result) {
                const table = this.tables.find(tab => {
                    return tab.getTableId() === id;
                });
                if (table) {
                    table.setTableName(name);
                    table.setTableDescription(description);
                    this.refresh();
                }
            }
        });
    }

    private toggleAssignUserView(status: boolean, table: TableModel) {
        this.setState({
            selectedTable: table,
            userAssignModalShown: true
        })
    }

    closeUserAssignModal = () => {
        this.setState({
            selectedTable: null,
            userAssignModalShown: false
        });
    }

    private renderModal() {
        return (<><UserAssign output={this.closeUserAssignModal} selectedTable={this.state.selectedTable} shown={this.state.userAssignModalShown}></UserAssign></>);
    }
}
