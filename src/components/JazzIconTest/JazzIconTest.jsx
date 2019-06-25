import React from 'react';
import Jazzicon from 'react-jazzicon';


export default class JazzIconTest extends React.Component {
    static getRows() {
        const rows = JSON.parse(localStorage.getItem('jazzicons')) || [];
        return rows.map((item) => {
            const seed = parseInt(item.slice(2, 10), 36);
            return (
                <div className="jazzicon_content">
                    <div>{item}</div>
                    <Jazzicon diameter={80} seed={seed} />
                </div>
            );
        });
    }
    constructor(props) {
        super(props);
        this.state = {
            code: '',
        };
    }

    clear() {
        localStorage.removeItem('jazzicons');
        this.forceUpdate();
    }

    addRow() {
        const rows = JSON.parse(localStorage.getItem('jazzicons')) || [];
        const { code } = this.state || '';
        if (!code) {
            return;
        }
        localStorage.setItem('jazzicons', JSON.stringify([...rows, code]));
        this.setState({ code: '' });
        this.forceUpdate();
    }

    handleInput(e) {
        const { value } = e.target;
        this.setState({ code: value });
    }

    render() {
        const content = this.constructor.getRows();
        return (
            <div className="jazzicon">
                <div className="jazzicon_header">
                    <input
                        className="jazzicon_input"
                        onChange={e => this.handleInput(e)}
                        value={this.state.code}
                        placeholder="input public key" />
                    <button className="s-button" onClick={() => this.addRow()}>Add</button>
                    <button className="s-button" onClick={() => this.clear()}>Clear localStorage</button>
                </div>
                {content}
            </div>
        );
    }
}
