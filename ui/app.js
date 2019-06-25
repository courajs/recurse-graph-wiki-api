import {collection} from '../lib/data-service.js';

export class Chat {
  constructor(el, name) {
    this.el = el;

    collection(name).then(c => {
      console.log('wanna render',name,'?');
      this.collection = c;
      this.render();
    });
  }

  render() {
    this.el.innerHTML = `
      <ul>
      </ul>
      <form>
        <input class="compose">
        <input type="submit">
      </form>
      `;

    let ul = this.el.querySelector('ul');
    let form = this.el.querySelector('form');
    let input = this.el.querySelector('.compose');

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

export default class App {
  constructor(el) {
    this.el = el;
    this.render();
  }

  render() {
    this.el.innerHTML = `
      <h1>Double chat!</h1>
      <div class="chat-app" id="chat1"></div>
      <div class="chat-app" id="chat2"></div>
      `;

    let chats = this.el.querySelectorAll('.chat-app');
    chats.forEach(el => {
      console.log(el.id, el);
      new Chat(el, el.id);
    });
  }
}
