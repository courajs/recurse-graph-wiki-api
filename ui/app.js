import {collection} from '../lib/data-service.js';

export default class App {
  constructor(el) {
    this.el = el;

    collection('chat').then(c => {
      this.collection = c;
      this.render();
    });
  }

  render() {
    this.el.innerHTML = `
      <h1>Messages</h1>
      <ul>
      </ul>
      <form>
        <input id="chat">
        <input type="submit">
      </form>
      `;

    let ul = this.el.querySelector('ul');
    let form = this.el.querySelector('form');
    let input = this.el.querySelector('#chat');

    this.renderList();
    this.collection.onUpdate(()=>this.renderList());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let message = {
        time: new Date().valueOf(),
        text: input.value,
      };
      this.collection.write([message]);
      input.value = '';
    });
  }

  renderList() {
    let ul = this.el.querySelector('ul');
    ul.innerHTML = '';
    this.collection.data
      .sort((a,b) => a.time - b.time)
      .forEach(m => {
        let li = document.createElement('li');
        let time = new Date(m.time).toLocaleTimeString();
        li.innerText = time +': '+m.text;
        ul.appendChild(li);
      });
  }
}
