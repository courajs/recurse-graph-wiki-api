import {
  open,
  getFromCollection,
  writeToCollection,
  ensureClockForCollection,
} from './db.js';

navigator.serviceWorker.ready.then(function(reg) {
  let send = (kind,value) => navigator.serviceWorker.controller.postMessage({kind,value});

  // we want to avoid opening websockets and such for not-yet-active
  // service workers. buuuut you can't actually tell from inside the
  // service worker whether you're active or not. you can listen to
  // the 'activate' event, but that only fires once, *ever*, per sw.
  // the sw can be shut down due to no open tabs, then run again later,
  // and have no way to tell that it's already been activated.
  // so, we just ping from every active tab when they first start up,
  // and that will trigger socket initialization in the sw if necessary.
  send('init');

  // these events aren't available within the service worker, but
  // they're useful hints for websocket reconnection attempts
  window.addEventListener('online', () => send('online'));
  window.addEventListener('offline', () => send('offline'));

  // firefox shuts down service workers after 30 seconds of idle.
  // but, we want it to keep the socket open in case of server events
  setInterval(() => send('keepawake'), 25000);

  window.auth = (name) => send('auth', name);
});

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
    return this.update();
  }
}

let db;
export async function collection(id) {
  if (!db) {
    db = await open();
  }
  await db.put('meta', 'chrome', 'client_id');

  await ensureClockForCollection(db, id);

  let c = new Collection(db, id);
  await c.update();

  return c;
}
