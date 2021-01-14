import React from "react";
import {Redirect} from "react-router-dom";
import UserService from "../services/user.service";
import Card from "react-bootstrap/Card";
import styles from "./tables.module.css";
import Button from "react-bootstrap/Button";
import ApiService from "../services/api.service";
import {ListModel} from "../models/list.model";
import {CardModel} from "../models/card.model";
// import DateTimePicker from 'react-datetime-picker';
import DatePicker from 'react-date-picker';
import Form from "react-bootstrap/Form";
import {Dropdown} from "react-bootstrap";
import {CardLogModel} from "../models/card-log.model";

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
        deadline: new Date(),
        list_id: 0
    }

    lists: ListModel[] = [];
    archivedLists: ListModel[] = [];
    archivedCards: CardModel[] = [];
    cards: CardModel[] = [];
    cardMembers = new Map();
    cardLogs: CardLogModel[] = [];

    async refresh() {
        this.setState({refresh: false});
        this.cardLogs = await ApiService.GetCardLogs(this.getTableId());
        this.setState({refresh: true});
    }

    handleBackToBoards() {
        this.setState({
            redirect: true,
            redirectUrl: 'tables'
        })
    }

    getTableId(): number {
        return +window.location.pathname.split('/')[2];
    }

    async componentDidMount() {
        const allLists = await ApiService.GetLists(this.getTableId());
        this.lists = allLists.filter(list => {
            return !list.ifArchived();
        });
        this.archivedLists = allLists.filter(list => {
            return list.ifArchived();
        });
        this.cardLogs = await ApiService.GetCardLogs(this.getTableId());
        const buffer = [];
        for (const list of this.lists) {
            let cards = await ApiService.GetCards(list.getListID());
            for (const card of cards) {
                buffer.push(card);
            }
        }
        this.cards = buffer.filter(card => {
            return !card.ifArchived();
        });
        this.archivedCards = buffer.filter(card => {
            return card.ifArchived();
        })
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

    private CardMenu(card: CardModel) {
        return <>
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    *
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => {
                        this.toggleCreationView(true, 'card', card.getCardID(), 'edit');
                    }}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.deleteCard(card);
                    }}>Archive</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.addUser(card);
                    }}>Add user</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.changeCardOrder(card, -1);
                    }}>Move up</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.changeCardOrder(card, 1);
                    }}>Move down</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.changeCardList(card, -1);
                    }}>Move to previous list</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.changeCardList(card, 1);
                    }}>Move to next list</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </>;
    }

    private ListMenu(list: ListModel) {
        return <>
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    *
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => {
                        this.toggleCreationView(true, 'list', list.getListID(), 'edit');
                    }}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.deleteList(list);
                    }}>Archive</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.changeListOrder(list.getListOrder(), -1);
                    }}>Move to left</Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        this.changeListOrder(list.getListOrder(), 1);
                    }}>Move to right</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </>;
    }

    private createLists() {
        let lists = [];
        if (this.state.refresh) {
            let view: any[] = [];
            this.lists = this.lists.sort((a, b) => {
                return compare(a.getListOrder(), b.getListOrder(), true);
            });
            this.lists.forEach(list => {
                view.push(<Card className={styles.card}>
                    <Card.Body>
                        <Card.Title className={styles.listTitle}>
                            {list.getListName()}
                            {this.ListMenu(list)}
                        </Card.Title>
                        {list.getDescription()}
                        {this.createCards(list.getListID())}
                        <Button className={styles.cardCreateButton} onClick={() => {
                            this.toggleCreationView(true, 'card', list.getListID(), 'create')
                        }}>Create new card</Button>
                    </Card.Body>
                </Card>);
            });
            lists.push(view);
        }
        return lists;
    }

    getVariant(object: string, action: string): string {
        if (this.state.objectToCreate === object && this.state.objectAction === action) {
            return 'success';
        } else {
            return 'primary';
        }
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
            <Button variant={this.getVariant('list', 'create')}
                    onClick={() => this.toggleCreationView(true, 'list', -1, 'create')}>New list</Button>
            <Button variant={this.getVariant('list', 'archived')}
                    onClick={() => this.toggleCreationView(true, 'list', -1, 'archived')}>Archived lists</Button>
            <Button variant={this.getVariant('card', 'archived')}
                    onClick={() => this.toggleCreationView(true, 'card', -1, 'archived')}>Archived cards</Button>
            <Button variant={this.getVariant('all', 'history')}
                    onClick={() => this.toggleCreationView(true, 'all', -1, 'history')}>History of changes</Button>
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

    private changeListOrder(actualOrder: number, step: number): void {
        const first = this.lists.find(searched => {
            return searched.getListOrder() === actualOrder;
        });

        if (!first) {
            return;
        }

        if (first.getListOrder() === this.getLastOrderIndex()) {
            return;
        }

        let second: ListModel | undefined = undefined;

        for (let i = 1; second === undefined; i++) {
            second = this.lists.find(searched => {
                return searched.getListOrder() === (actualOrder + (i * step));
            });
        }

        if (first && second) {
            ApiService.SwapListOrder(first, second).then(r => {
                if (second instanceof ListModel) {
                    const firstOrder = first.getListOrder();
                    const secondOrder = second.getListOrder();
                    first.setListOrder(secondOrder);
                    second.setListOrder(firstOrder);
                    this.refresh();
                }
            });
        }
    }

    private getLastOrderIndex(): number {
        if (this.lists.length === 0) {
            return -1;
        } else {
            return this.lists[this.lists.length - 1].getListOrder();
        }
    }

    private getFirstOrderIndex(): number {
        let lists = this.lists;
        if (this.lists.length <= 0) {
            return 0;
        } else {
            lists = this.lists.sort((a, b) => {
                return compare(a.getListOrder(), b.getListOrder(), false);
            });
            return lists[lists.length - 1].getListOrder();
        }
    }

    private async createList(name: string) {
        console.log(this.getLastOrderIndex());
        const response = await ApiService.CreateList(name, this.getTableId(), this.getLastOrderIndex() + 1);
        const list = new ListModel(response.list_id, response.list_name, response.list_description, response.list_order, response.is_archived);
        this.lists.push(list);
        this.refresh();
    }

    private async createCard(name: string, description: string, list_id: number, card_order: number, card_deadline: any) {
        const response = await ApiService.CreateCard(name, description, list_id, card_order, card_deadline);
        const card = new CardModel(response.card_id, response.list_id, response.card_name, response.card_description, response.is_archived, response.card_order, response.card_deadline);
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
                            <Form.Control name={'description'}
                                          onChange={this.handleChange.bind(this)}
                                          type="text"
                                          placeholder="Edit description"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button onClick={() => this.createList(this.state.newListName)}
                                variant={"success"}>Create</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')}
                                variant={"danger"}>Hide</Button>
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
                            <Form.Control type="date" name="deadline" onChange={this.handleChange.bind(this)} />
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button
                            onClick={() => this.createCard(this.state.newCardName, this.state.description, this.state.list_id, this.getCardLastOrderIndex(this.state.list_id) + 1, null)}
                            variant={"success"}>Create</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')}
                                variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        } else if (this.state.creationView && this.state.objectToCreate === 'card' && this.state.objectAction === 'edit') {
            const card = this.cards.filter(item => item.getCardID() === this.state.list_id);
            return (<>
                    <div className={styles.createNewButtonDiv}>
                        <Form.Group>
                            <Form.Control name={'newCardName'}
                                          onChange={this.handleChange.bind(this)} defaultValue={card[0].getCardName()}
                                          type="text"
                                          placeholder="Edit card name"/>
                            <Form.Control name={'description'}
                                          onChange={this.handleChange.bind(this)}
                                          defaultValue={card[0].getCardDescription()} type="text"
                                          placeholder="Description"/>
                            <Form.Control type="date" name="deadline"
                                          defaultValue={this.getIntDate(card[0].getCardDeadline())}
                                          onChange={this.handleChange.bind(this)}/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button
                            onClick={() => this.editCard(card[0].getCardID(), this.state.newCardName, this.state.description, this.state.deadline)}
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
                                          onChange={this.handleChange.bind(this)} defaultValue={list[0].getListName()}
                                          type="text"
                                          placeholder="Edit list name"/>
                            <Form.Control name={'description'}
                                          onChange={this.handleChange.bind(this)}
                                          defaultValue={list[0].getDescription()} type="text"
                                          placeholder="Edit description"/>
                        </Form.Group>
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button
                            onClick={() => this.editList(list[0].getListID(), this.state.newListName, this.state.description, this.getTableId(), 0)}
                            variant={"success"}>Edit</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')}
                                variant={"danger"}>Hide</Button>
                    </div>
                </>
            );
        } else if (this.state.creationView && this.state.objectToCreate === 'list' && this.state.objectAction === 'archived') {
            return <>
                <div>
                    <h1 className={styles.tableH1}>Archived lists</h1>
                    <div className={styles.archivedTables}>
                        {this.getArchivedLists()}
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button
                            onClick={() => this.deleteAllLists()}
                            variant={"success"}>Delete all</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')}
                                variant={"danger"}>Hide</Button>
                    </div>
                </div>
            </>
        } else if (this.state.creationView && this.state.objectToCreate === 'card' && this.state.objectAction === 'archived') {
            return <>
                <div>
                    <h1 className={styles.tableH1}>Archived cards</h1>
                    <div className={styles.archivedTables}>
                        {this.getArchivedCards()}
                    </div>
                    <div className={styles.createNewButtonDiv}>
                        <Button
                            onClick={() => this.deleteAllCards()}
                            variant={"success"}>Delete all</Button>
                        <Button onClick={() => this.toggleCreationView(false, '', -1, '')}
                                variant={"danger"}>Hide</Button>
                    </div>
                </div>
            </>
        } else if (this.state.creationView && this.state.objectToCreate === 'all' && this.state.objectAction === 'history') {
            return <>
                {this.createLogs()}
            </>
        }
    }

    private toggleCreationView(status: boolean, object: string, list_id: number, action: string) {
        if (this.state.creationView === status && this.state.objectToCreate === object && this.state.list_id === list_id && this.state.objectAction === action) {
            this.setState({creationView: false, objectToCreate: '', list_id: -1, objectAction: ''})
        } else {
            this.setState({creationView: status, objectToCreate: object, list_id: list_id, objectAction: action})
        }
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
            this.cards.sort((a, b) => {
                return compare(a.getCardOrder(), b.getCardOrder(), true);
            });
            this.cards.forEach(card => {
                if (card.getCardListID() === list_id) {
                    view.push(<Card className={styles.cardObject}>
                        <Card.Body>
                            <Card.Title className={styles.listTitle}>
                                {card.getCardName()}
                                {this.CardMenu(card)}
                            </Card.Title>
                            <p>{card.getCardDescription()}</p>
                            <p>{card.getCleanCardDeadline()}</p>
                            {/*{this.getCardMembers(card.getCardID())}*/}
                        </Card.Body>
                    </Card>);
                }
            });
            cards.push(view);
        }
        return cards;
    }

    private deleteCard(card: CardModel) {
        if (card.ifArchived()) {
            const index = this.archivedCards.indexOf(card);

            if (index !== -1) {
                ApiService.DeleteCard(card).then(() => {
                    this.archivedCards.splice(index, 1);
                    this.refresh();
                });
            }
        } else {
            const index = this.cards.indexOf(card);

            if (index !== -1) {
                ApiService.EditCard(card.getCardID(), card.getCardName(), card.getCardDescription(), 1, -1, card.getCardDeadline()).then(() => {
                    this.cards.splice(index, 1);
                    card.setArchived(1);
                    this.archivedCards.push(card);
                    this.refresh();
                })
            }
        }
    }

    private deleteList(list: ListModel) {
        if (list.ifArchived()) {
            const index = this.archivedLists.indexOf(list);
            if (index !== -1) {
                ApiService.DeleteList(list).then(() => {
                    this.archivedLists.splice(index, 1);
                    this.refresh();
                });
            }
        } else {
            const index = this.lists.indexOf(list);
            if (index !== -1) {
                ApiService.EditList(list.getListID(), list.getListName(), list.getDescription(), this.getTableId(), 1).then(() => {
                    this.lists.splice(index, 1);
                    list.setArchived(1);
                    this.archivedLists.push(list);
                    this.refresh();
                });
            }
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

    private async editCard(id: number, name: string, description: string, deadline: Date) {
        const response = await ApiService.EditCard(id, name, description, 0, -1, deadline);
        if (response) {
            this.cards.map(item => {
                if (item.getCardID() === id) {
                    item.setName(name);
                    item.setDescription(description);
                    item.setDeadline(deadline);
                    return item;
                }
            });
            this.refresh();
        }
    }

    private async editList(id: number, name: string, description: string, table_id: number, is_archived: number) {
        const response = await ApiService.EditList(id, name, description, table_id, is_archived);
        if (response) {
            this.lists.map(item => {
                if (item.getListID() === id) {
                    item.setName(name);
                    item.setDescription(description);
                    return item;
                }
            });
            this.refresh();
        }
    }

    private getArchivedLists() {
        let lists = [];
        if (this.state.refresh) {
            let view: any[] = [];
            this.archivedLists.forEach(list => {
                view.push(<Card className={styles.card}>
                    <Card.Body>
                        <Card.Title className={styles.listTitle}>
                            {list.getListName()}
                        </Card.Title>
                        {list.getDescription()}
                        <Button className={styles.cardCreateButton} onClick={() => {
                            this.restoreList(list);
                        }}>Restore</Button>
                        <Button variant={"danger"} className={styles.cardCreateButton} onClick={() => {
                            this.deleteList(list)
                        }}>Delete</Button>
                    </Card.Body>
                </Card>);
            });
            lists.push(view);
        }
        return lists;
    }

    private restoreList(list: ListModel): void {
        const index = this.archivedLists.indexOf(list);

        if (index !== -1 && list.ifArchived()) {
            ApiService.EditList(list.getListID(), list.getListName(), list.getDescription(), this.getTableId(), 0).then(() => {
                this.archivedLists.splice(index, 1);
                list.setArchived(0);
                list.setListOrder(this.getLastOrderIndex() + 1);
                this.lists.push(list);
                this.refresh();
            });
        }
    }

    private restoreCard(card: CardModel): void {
        const index = this.archivedCards.indexOf(card);

        if (index !== -1 && card.ifArchived()) {
            ApiService.EditCard(card.getCardID(), card.getCardName(), card.getCardDescription(), 0, this.getCardLastOrderIndex(card.getCardListID()) + 1, card.getCardDeadline()).then(() => {
                this.archivedCards.splice(index, 1);
                card.setArchived(0);
                card.setCardOrder(this.getCardLastOrderIndex(card.getCardListID()));
                this.cards.push(card);
                this.refresh();
            });
        }
    }

    private deleteAllLists(): void {
        for (let list of this.archivedLists) {
            ApiService.DeleteList(list);
        }
        this.archivedLists = [];
        this.refresh();
    }

    private deleteAllCards(): void {
        for (let card of this.archivedCards) {
            ApiService.DeleteCard(card);
        }
        this.archivedCards = [];
        this.refresh();
    }

    private getArchivedCards() {
        let cards = [];
        if (this.state.refresh) {
            let view: any[] = [];
            this.archivedCards.forEach(card => {
                view.push(<Card className={styles.cardObject}>
                    <Card.Body>
                        <Card.Title>
                            {card.getCardName()} From {this.getListName(card.getCardListID())}
                        </Card.Title>
                        <p>{card.getCardDescription()}</p>
                        {/*{this.getCardMembers(card.getCardID())}*/}
                        <div className={styles.btnGroup}>
                            <Button className={styles.cardButton} onClick={() => {
                                this.restoreCard(card);
                            }}>Restore</Button>
                            <Button className={styles.cardButton} onClick={() => {
                                this.deleteCard(card);
                            }} variant={"danger"}>Delete</Button>
                        </div>
                    </Card.Body>
                </Card>);
            });
            cards.push(view);
        }
        return cards;
    }

    private getListName(cardListID: number): string {
        const list = this.lists.find(list => {
            return list.getListID() === cardListID;
        });

        if (list) {
            return list.getListName();
        } else {
            const archivedList = this.archivedLists.find(list => {
                return list.getListID() === cardListID;
            });

            if (archivedList) {
                return archivedList.getListName();
            } else {
                return '(Does not exist anymore)';
            }
        }
    }

    private getCardLastOrderIndex(list_id: number) {
        const cards = this.cards.filter(card => {
            return card.getCardListID() === list_id;
        });

        if (cards.length <= 0) {
            return 0;
        } else {
            cards.sort((a, b) => {
                return compare(a.getCardOrder(), b.getCardOrder(), true);
            });
            return cards[cards.length - 1].getCardOrder();
        }
    }

    private changeCardOrder(card: CardModel, step: number) {
        if (card.getCardOrder() === this.getCardLastOrderIndex(card.getCardListID()) && step > 0) {
            return;
        } else if (card.getCardOrder() === this.getCardFirstOrderIndex(card.getCardListID()) && step < 0) {
            return;
        }

        let second: CardModel | undefined = undefined;

        for (let i = 1; second === undefined; i++) {
            second = this.cards.find(searched => {
                return searched.getCardOrder() === (card.getCardOrder() + (i * step)) && searched.getCardListID() === card.getCardListID();
            });
        }

        if (second) {
            ApiService.SwapCardOrder(card, second).then(r => {
                if (second instanceof CardModel) {
                    const firstOrder = card.getCardOrder();
                    const secondOrder = second.getCardOrder();
                    card.setCardOrder(secondOrder);
                    second.setCardOrder(firstOrder);
                    this.refresh();
                }
            });
        }
    }

    private createLogs() {
        let logs = [];
        if (this.state.refresh) {
            let view: any[] = [];
            this.cardLogs.forEach(log => {
                view.push(<Card className={styles.card}>
                    <Card.Body>
                        {log.getLogContent()}
                        {/*<Button className={styles.cardCreateButton} onClick={() => {*/}
                        {/*    this.toggleCreationView(true, 'card', list.getListID(), 'create')*/}
                        {/*}}>Create new card</Button>*/}
                    </Card.Body>
                </Card>);
            });
            logs.push(view);
        }
        return logs;
    }

    private getCardFirstOrderIndex(list_id: number) {
        const cards = this.cards.filter(card => {
            return card.getCardListID() === list_id;
        });

        if (cards.length <= 0) {
            return 0;
        } else {
            cards.sort((a, b) => {
                return compare(a.getCardOrder(), b.getCardOrder(), false);
            });
            return cards[cards.length - 1].getCardOrder();
        }
    }

    private getIntDate(cardDeadline: Date): number {
        return new Date(cardDeadline).getTime();
    }

    private changeCardList(card: CardModel, step: number) {

        const first = this.lists.find(list => {
           return list.getListID() === card.getCardListID();
        });

        if (first instanceof ListModel) {
            // if (first.getListOrder() === this.getLastOrderIndex() && step > 0) {
            //     return;
            // } else if (first.getListOrder() === this.getFirstOrderIndex() && step < 0) {
            //     return;
            // }

            let second: ListModel | undefined = undefined;

            if (first instanceof ListModel) {
                for (let i = 1; second === undefined; i++) {
                    second = this.lists.find(searched => {
                        return searched.getListOrder() === (first.getListOrder() + (i * step));
                    });
                }

                if (second) {
                    ApiService.ChangeCardOnListOrder(card, second.getListID()).then(r => {
                        if (second instanceof ListModel) {
                            card.setCardListID(second.getListID());
                            this.refresh();
                        }
                    });
                }
            }
        }


        // if (card.getCardOrder() === this.getCardLastOrderIndex(card.getCardListID()) && step > 0) {
        //     return;
        // } else if (card.getCardOrder() === this.getCardFirstOrderIndex(card.getCardListID()) && step < 0) {
        //     return;
        // }


        //
        // for (let i = 1; second === undefined; i++) {
        //     second = this.lists.find(searched => {
        //         return searched.getListOrder() === (card.getCardOrder() + (i * step)) && searched.getCardListID() === card.getCardListID();
        //     });
        // }

        // if (second) {
        //     ApiService.SwapCardOrder(card, second).then(r => {
        //         if (second instanceof CardModel) {
        //             const firstOrder = card.getCardOrder();
        //             const secondOrder = second.getCardOrder();
        //             card.setCardOrder(secondOrder);
        //             second.setCardOrder(firstOrder);
        //             this.refresh();
        //         }
        //     });
        // }
    }
}

function compare(a: string | number, b: string | number, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

