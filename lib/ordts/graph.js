import {cmp, eq, gt} from './ids.js';

export class Graph {
  constructor(id, atoms) {
    this.id = id;
    if (atoms) {
      this.atoms = atoms.slice();
    } else {
      this.atoms = [];
    }
    this._determineIndexAndLamport();
  }

  _determineIndexAndLamport() {
    let index = 0;
    let lamport = 0;
    for (let a of this.atoms) {
      if (a.id.lamport > lamport) {
        lamport = a.id.lamport;
      }
      if (a.id.site === this.id && a.id.index > index) {
        index = a.id.index;
      }
    }
    this.currentIndex = index;
    this.currentLamport = lamport;
  }

  nextId() {
    return {
      site: this.id,
      index: ++this.currentIndex,
      lamport: ++this.currentLamport,
      wall: new Date().valueOf(),
    };
  }

  evaluate() {
    return new Instance({
      nodes: [123,456],
      outgoing: {
        123: [456],
      },
    });
  }

  // sort, then iterate over and merge
  mergeAtoms(atoms) {
    atoms.sort((a,b)=>cmp(a.id,b.id));
    let ours = 0;
    let theirs = 0;
    let result = [];
    while (ours < this.atoms.length && theirs < atoms.length) {
      let here = this.atoms[ours];
      let there = atoms[theirs];
      // skip duplicates
      if (eq(here.id, there.id)) {
        ours++;
        theirs++;
      } else if (lt(here.id, there.id)) {
        result.push(here);
        ours++;
      } else {
        result.push(there);
        theirs++;
      }
    }
    // add remainders at end
    result.push(...this.atoms.slice(ours));
    result.push(...atoms.slice(theirs));
    this.atoms = result;
    this._determineIndexAndLamport();
  }

  addPage() {
    let newpage = {
      id: this.nextId(),
      type: 'page',
      uuid: Math.random().toString(),
    };
    this.mergeAtoms([newpage]);
    return newpage;
  }

  addLink(fromuuid, touuid) {
    let newlink = {
      id: this.nextId(),
      type: 'link',
      uuid: Math.random().toString(),
      from: fromuuid,
      to: touuid,
    };
    this.mergeAtoms([newlink]);
    return newlink;
  }

  // if uuid points to a link, just mark it as deleted
  // if uuid points to a page, should we also mark all links to/from it?
  // del(uuid) {}
}

class Instance {
  constructor(arg) {
    Object.assign(this, arg);
  }
}

export default Graph;
