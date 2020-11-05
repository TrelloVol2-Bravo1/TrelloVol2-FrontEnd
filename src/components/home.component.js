import React from 'react';
import '../App.css';

export default class HomeComponent extends React.Component {

    state = {
        loading: true,
        message: '',
    }

    connection = {
        url: "https://trello-back-bravo1.herokuapp.com/"
    }
    

    async postMethod() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({message: this.state.message})
        };

        if (this.state.message.toString().length > 0 ) {
            const url = this.connection.url;
            const response = await fetch(url, requestOptions);
            const data = await response.json();
            this.setState({message: data.message});
        }
    }

    updateState = (text) => {
        text.then(res => console.log(res))
    }

    async componentDidMount() {
        const url = this.connection.url;
        const response = await fetch(url);
        const data = await response.json();
        this.setState({ message: data.message });
    }

    handleSumbit = (event) => {
        alert(this.state.message)
    }

    handleChange = (event) => {
        this.setState({ message: event.target.value });
    }


    render() {
        return <>
            <div>
            <h1>Message: {this.state.message ? this.state.message : "Wpisz coś!!!!"}</h1>
            <form>
                <label>
                    Message on server:
          <input type="text" value={this.state.message} onChange={this.handleChange} />
                </label>
            </form>
            <button onClick={() => this.postMethod()}>Sumbit</button>
    <h1>Mode:{process.env.REACT_APP_TEST}</h1>
            </div>
        </>
            ;
    }
}