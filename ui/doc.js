import {getClientName, collection} from '../lib/data-service.js';
import Sequence from '../lib/ordts/sequence.js';

export default class Doc {
  constructor(el, name) {
    this.el = el;

    Promise.all([collection(name), getClientName()]).then(([c, client_name]) => {
      this.collection = c;
      this.sequence = new Sequence(client_name, c.data);
      this.render();
    });
  }

  render() {
    this.el.innerHTML = `
      <textarea></textarea>
    `;
    this.collection.onUpdate(()=>this.updateText());
    this.el.querySelector('textarea').addEventListener('input', (e) => {
      let fresh = this.sequence.become(e.target.value);
      this.collection.write(fresh);
    });
    this.updateText();
  }

  updateText() {
    this.sequence.mergeAtoms(this.collection.data);
    this.el.querySelector('textarea').value = this.sequence.evaluate();
  }
}
