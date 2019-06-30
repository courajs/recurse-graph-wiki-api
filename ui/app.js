import {
  isAuthed,
  whenAuthed,
  auth,
} from '../lib/data-service.js';

import Chat from './chat.js';
import Doc from './doc.js';

export default class App {
  constructor(el) {
    this.el = el;
    this.render();
    this.state='authing';
  }

  async render() {
    let authed = await isAuthed();
    if (!authed) {
      this.renderAuthPrompt();
      await whenAuthed;
    }
    this.state = 'authed';
    this.renderChats();
  }

  renderAuthPrompt() {
    this.el.innerHTML = `
      <h1>What's your user id?</h1>
      <form>
        <input class="id-entry">
        <input type="submit">
      </form>
      `;
    let input = this.el.querySelector('.id-entry');
    let form = this.el.querySelector('form');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      auth(input.value);
    });
  }

  renderChats() {
    this.el.innerHTML = `
      <h1>Chat!</h1>
      <div class="chat-app" id="chat1"></div>
      <div class="chat-app" id="chat2"></div>
      <div class="doc-app" id="doc1"></div>
      <div class="doc-app" id="doc2"></div>
      `;

    let chats = this.el.querySelectorAll('.chat-app');
    chats.forEach(el => {
      new Chat(el, el.id);
    });
    let docs = this.el.querySelectorAll('.doc-app');
    docs.forEach(el => {
      new Doc(el, el.id);
    });
  }
}
