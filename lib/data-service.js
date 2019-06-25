import {
  open,
  getFromCollection,
  writeToCollection,
  ensureClockForCollection,
} from './db.js';
import * as sw from './sw-comms.js';

export class Collection {
  constructor(db, id) {
    this.db = db;
    this.id = id;
    this.clock = {local:0,remote:0};
    this.data = [];
    this.handlers = [];
  }

  async update() {
    let {
      clock,
      values
    } = await getFromCollection(this.db, this.id, this.clock);
    this.clock = clock;
    this.data.push(...values);
    this._notify();
  }

  onUpdate(h) {
    this.handlers.push(h);
  }

  _notify() {
    this.handlers.forEach(h=>h(this.data));
  }

  async write(data) {
    if (!Array.isArray(data)) { throw new Error('pass an array'); }
    await writeToCollection(this.db, this.id, data);
    sw.send('update');
    return this.update();
  }
}

let db;
export async function collection(id) {
  if (!db) {
    db = await open();
  }
  // await db.put('meta', 'firefox', 'client_id');

  await ensureClockForCollection(db, id);

  let c = new Collection(db, id);
  await c.update();
  sw.on('update', ()=>c.update());

  return c;
}
