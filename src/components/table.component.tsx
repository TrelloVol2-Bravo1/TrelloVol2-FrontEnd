import React from "react";
import {Redirect} from "react-router-dom";
import UserService from "../services/user.service";
import Card from "react-bootstrap/Card";
import styles from "./tables.module.css";
import Button from "react-bootstrap/Button";
import ApiService from "../services/api.service";
import {ListModel} from "../models/list.model";
import {CardModel} from "../models/card.model";
import Form from "react-bootstrap/Form";

export default class TablesComponent extends React.Component {

    state = {
        redirect: false,
        redirectUrl: '',
        refresh: false,
        creationView: false,
        newListName: '',
        objectToCreate: '',
        newCardName: '',
        description: '',
        objectAction: '',
        list_id: 0
    }

    lists: ListModel[] = [];
    cards: CardModel[] = [];
    cardMembers = new Map();

    private refresh(): void {
        this.setState({refresh: false});

        this.setState({refresh: true});
    }

    handleBackToBoards() {
        this.setState({
            redirect: true,
            redirectUrl: 'tables'
        })
    }

    async componentDidMount() {
        this.lists = await ApiService.GetLists(+window.location.pathname.split('/')[2]);
        const buffer = [];
        for (const list of this.lists) {
            let cards = await ApiService.GetCards(list.getListID());
            for (const card of cards) {
                buffer.push(card);
            }
        }
        this.cards = buffer;
        for (const card of this.cards) {
            const response = await ApiService.GetUserIDs(card.getCardID());
            const userNames = [];
            for (let i = 0; i < response.length; i++) {
                userNames.push(await ApiService.GetUserName(response[i]));
            }
            this.cardMembers.set(card.getCardID(), userNames);
        }
        console.log(this.cardMembers);
        this.refresh();
    }

    private createLists() {
        let lists = [];
        if (this.state.refresh) {
            let view: any[] = [];
            this.lists.forEach(list => {
                view.push(<Card className={styles.card}>
                    <Card.Body>
                        <Card.Title className={styles.listTitle}>
                            {list.getListName()}
                            <Button className={styles.cardButton} onClick={() => {
                                this.toggleCreationView(true, 'list', list.getListID(), 'edit');
                            }} variant={"primary"}>Edit</Button>
                            <Button className={styles.cardButton} onClick={() => {
                                this.deleteList(list);
                            }} variant={"danger"}>Delete</Button>
                        </Card.Title>
                        {this.createCards(list.getListID())}
                        <Button className={styles.cardCreateButton} onClick={() => {this.toggleCreationView(true, 'card', list.getListID(), 'create')}}>Create new card</Button>
                    </Card.Body>
                </Card>)
            });
            lists.push(view);
        }
        return lists;
    }

    render = () => {
        UserService.subject.subscribe(() => {
            this.setState({
                redirect: true,
                redirectUrl: 'login'
            })
        });
        return <>
            {this.renderRedirect()}
            <Button onClick={() => this.handleBackToBoards()}>Back to boards</Button>
            <Button onClick={() => this.toggleCreationView(true, 'list', -1, 'create')}>New list</Button>
            <div className={styles.container}>
                <div className={styles.creationForm}>
                    {this.createListCreationView()}
                </div>
                <div className={styles.tables}>
                    {this.createLists()}
                </div>
            </div>
        </>;
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    private async createList(name: string) {
        const response = await ApiService.CreateList(name, +window.location.pathname.split('/')[2]);
        const list = new ListModel(response.list_id, response.list_name);
        this.lists.push(list);
        this.refresh();
    }

    private async createCard(name: string, description: string, list_id: number) {
        const response = await ApiService.CreateCard(name, description, list_id);
        const card = new CardModel(response.card_id, response.list_id, response.card_name, response.card_description);
        this.cards.push(card);
        this.refresh();
    }

    private createListCreationView() {
        if (this.state.creationView && this.state.objectToCreate === 'list' && this.state.objectAction === 'create') {
            return (<>
                    <div className={styles.createNewButtonDiv}>
                        <Form.Group>
                            <Form.Control name={'newListName'}
                                          onChange={this.handleChange.bind(this)} type="text"
                                          placeholder="New list name"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button onClick={() => this.createList(this.state.newListName)}
                                variant={"success"}>Create</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')} variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        } else if (this.state.creationView && this.state.objectToCreate === 'card' && this.state.objectAction === 'create') {
            return (<>
                    <div className={styles.createNewButtonDiv}>
                        <Form.Group>
                            <Form.Control name={'newCardName'}
                                          onChange={this.handleChange.bind(this)} type="text"
                                          placeholder="New card name"/>
                            <Form.Control name={'description'}
                                          onChange={this.handleChange.bind(this)} type="text"
                                          placeholder="Description"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button onClick={() => this.createCard(this.state.newCardName, this.state.description, this.state.list_id)}
                                variant={"success"}>Create</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')} variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        } else if (this.state.creationView && this.state.objectToCreate === 'card' && this.state.objectAction === 'edit') {
            const card = this.cards.filter(item => item.getCardID() === this.state.list_id);
            return (<>
                    <div className={styles.createNewButtonDiv}>
                        <Form.Group>
                            <Form.Control name={'newCardName'}
                                          onChange={this.handleChange.bind(this)} defaultValue={card[0].getCardName()} type="text"
                                          placeholder="Edit card name"/>
                            <Form.Control name={'description'}
                                          onChange={this.handleChange.bind(this)} defaultValue={card[0].getCardDescription()} type="text"
                                          placeholder="Edit description"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button
                            onClick={() => this.editCard(card[0].getCardID(), this.state.newCardName, this.state.description)}
                            variant={"success"}>Edit</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')}
                                variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        } else if (this.state.creationView && this.state.objectToCreate === 'list' && this.state.objectAction === 'edit') {
            const list = this.lists.filter(item => item.getListID() === this.state.list_id);
            return (<>
                    <div className={styles.createNewButtonDiv}>
                        <Form.Group>
                            <Form.Control name={'newCardName'}
                                          onChange={this.handleChange.bind(this)} defaultValue={list[0].getListName()} type="text"
                                          placeholder="Edit list name"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button
                            onClick={() => this.editList(list[0].getListID(), this.state.newCardName, +window.location.pathname.split('/')[2])}
                            variant={"success"}>Edit</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')}
                                variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        }
    }

    private toggleCreationView(status: boolean, object: string, list_id: number, action: string) {
        this.setState({creationView: status, objectToCreate: object, list_id: list_id, objectAction: action})
    }

    private renderRedirect() {
        if (this.state.redirect) {
            return <Redirect to={'/' + this.state.redirectUrl}/>
        }
    }

    private createCards(list_id: number) {
        let cards = [];
        if (this.state.refresh) {
            let view: any[] = [];
            this.cards.forEach(card => {
                if (card.getCardListID() === list_id) {
                    view.push(<Card className={styles.cardObject}>
                        <Card.Body>
                            <Card.Title>
                                {card.getCardName()}
                            </Card.Title>
                            <p>{card.getCardDescription()}</p>
                            {this.getCardMembers(card.getCardID())}
                            <div className={styles.btnGroup}>
                                <Button className={styles.cardButton} onClick={() => {
                                    this.deleteCard(card);
                                }} variant={"danger"}>Delete</Button>
                                <Button className={styles.cardButton} onClick={() => {
                                    this.toggleCreationView(true, 'card', card.getCardID(), 'edit');
                                }} variant={"primary"}>Edit</Button>
                                <Button className={styles.cardButton} onClick={() => {
                                    this.addUser(card);
                                }} variant={"info"}>Add user</Button>
                            </div>
                        </Card.Body>
                    </Card>);
                }
            });
            cards.push(view);
        }
        return cards;
    }

    private deleteCard(card: CardModel) {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            ApiService.DeleteCard(card).then(() => {
                this.cards.splice(index, 1);
                this.refresh();
            });
        }
    }

    private deleteList(list: ListModel) {
        const index = this.lists.indexOf(list);
        if (index !== -1) {
            ApiService.DeleteList(list).then(() => {
                this.lists.splice(index, 1);
                this.refresh();
            });
        }
    }

    private addUser(card: CardModel) {
        ApiService.ConnectUserToCard(2, card.getCardID());
    }

    private getCardMembers(cardID: number) {
        const array = this.cardMembers.get(cardID);
        let view: any[] = [];
        for (let i = 0; i < array.length; i++) {
            view.push(<p className={styles.redText}>{array[i]}</p>);
        }
        return view;
    }

    private async editCard(id: number, name: string, description: string) {
        const response = await ApiService.EditCard(id, name, description);
        if (response) {
            this.cards.map(item => {
                if (item.getCardID() === id) {
                    item.setName(name);
                    item.setDescription(description);
                    return item;
                }
            });
            this.refresh();
        }
    }

    private async editList(id: number, name: string, table_id: number) {
        const response = await ApiService.EditList(id, name, table_id);
        if (response) {
            this.lists.map(item => {
                if (item.getListID() === id) {
                    item.setName(name);
                    return item;
                }
            });
            this.refresh();
        }
    }
}
