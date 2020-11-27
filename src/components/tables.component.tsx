import React from "react";
import ApiService from "../services/api.service";
import {TableModel} from "../models/table.model";
import styles from "./tables.module.css";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

export default class TablesComponent extends React.Component {

    state = {
        refresh: false,
        creationView: false,
        newTableName: ''
    }

    tables: TableModel[] = [];

    async componentDidMount() {
        this.tables = await ApiService.GetTables();
        this.refresh();
    }

    private deleteTable(table: TableModel) {
        const index = this.tables.indexOf(table);
        if (index !== -1) {
            ApiService.DeleteTable(table);
            this.tables.splice(index, 1);
            this.refresh();
        }
    }

    private refresh(): void {
        this.setState({refresh: false});
        this.setState({refresh: true});
    }

    private createTableView() {
        let table = [];
        if (this.state.refresh) {
            let view: any[];
            view = [];
            this.tables.forEach(tab => {
                view.push(<Card className={styles.card}>
                    <Card.Body>
                        <Card.Title>
                            {tab.getTableName()}
                        </Card.Title>
                        <div className={styles.btnGroup}>
                            <Button className={styles.btn} variant={"success"}>Open</Button>
                            <Button className={styles.btn} onClick={() => {
                                this.deleteTable(tab);
                            }} variant={"danger"}>Delete</Button>
                        </div>
                    </Card.Body>
                </Card>)
            });
            table.push(view);
        }
        return table;
    }

    private async createTable(name: string) {
        const response = await ApiService.CreateTable(name);
        const table = new TableModel(response.id, response.name, response.author_id);
        this.tables.push(table);
        this.refresh();

    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    private createTableCreationView() {
        if (this.state.creationView) {
            return (<>
                    <div className={styles.createNewButtonDiv}>
                        <Form.Group>
                            <Form.Control name={'newTableName'} value={this.state.newTableName} onChange={this.handleChange.bind(this)} type="text" placeholder="New table name"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button onClick={() => this.createTable(this.state.newTableName)} variant={"success"}>Create</Button>
                        <Button onClick={() => this.toggleCreationView(false)} variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        }
    }

    private toggleCreationView(status: boolean) {
        this.setState({creationView: status})
    }


    render() {
        return (<>
            <div className={styles.container}>
                <div className={styles.creationForm}>
                    {this.createTableCreationView()}
                </div>
                <div className={styles.tables}>
                    {this.createTableView()}
                </div>
                <div className={styles.createNewButtonDiv}>
                    <Button onClick={() => this.toggleCreationView(true)} className={styles.createNewButton}>
                        Create table
                    </Button>
                </div>
            </div>
        </>);
    }
}