/**
 * Database Layer - Dual Mode Support (NeDB / Vercel KV)
 * Local development: Zero-installation, file-based NeDB.
 * Production (Vercel): Cloud-hosted Vercel KV (Redis Hash) via KV_REST_API_URL.
 */
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ─── Dual Database Connection Initialization ──────────────────────────────
let useKV = false;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  useKV = true;
  console.log('⚡ Vercel KV environment detected! Running in serverless cloud mode.');
} else {
  console.log('💾 Running in local mode using disk-based NeDB.');
}

// Ensure local data directory exists (only if running NeDB locally)
let db = {};
if (!useKV) {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  db = {
    users:      new Datastore({ filename: path.join(dataDir, 'users.db'),      autoload: true }),
    reports:    new Datastore({ filename: path.join(dataDir, 'reports.db'),    autoload: true }),
    shelters:   new Datastore({ filename: path.join(dataDir, 'shelters.db'),   autoload: true }),
    volunteers: new Datastore({ filename: path.join(dataDir, 'volunteers.db'), autoload: true }),
    adoptions:  new Datastore({ filename: path.join(dataDir, 'adoptions.db'),  autoload: true }),
    chatlogs:   new Datastore({ filename: path.join(dataDir, 'chatlogs.db'),   autoload: true }),
  };
}

// ─── Mode A: Local Promisified NeDB Model Wrapper ───────────────────────────
class Model {
  constructor(datastore, defaults = {}) {
    this.ds = datastore;
    this.defaults = defaults;
  }

  _applyDefaults(data) {
    const doc = { ...this.defaults, ...data, createdAt: new Date(), updatedAt: new Date() };
    return doc;
  }

  // INSERT
  async create(data) {
    const doc = this._applyDefaults(data);
    return new Promise((res, rej) =>
      this.ds.insert(doc, (err, newDoc) => (err ? rej(err) : res(newDoc)))
    );
  }

  async insertMany(docs) {
    const withDefaults = docs.map((d) => this._applyDefaults(d));
    return new Promise((res, rej) =>
      this.ds.insert(withDefaults, (err, newDocs) => (err ? rej(err) : res(newDocs)))
    );
  }

  // FIND
  async find(query = {}, projection = {}) {
    return new Promise((res, rej) =>
      this.ds.find(query, (err, docs) => (err ? rej(err) : res(docs)))
    );
  }

  async findOne(query = {}) {
    return new Promise((res, rej) =>
      this.ds.findOne(query, (err, doc) => (err ? rej(err) : res(doc)))
    );
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async findWithOptions(query = {}, { sort = {}, skip = 0, limit = 0 } = {}) {
    return new Promise((res, rej) => {
      let cursor = this.ds.find(query);
      if (Object.keys(sort).length) cursor = cursor.sort(sort);
      if (skip) cursor = cursor.skip(skip);
      if (limit) cursor = cursor.limit(limit);
      cursor.exec((err, docs) => (err ? rej(err) : res(docs)));
    });
  }

  // COUNT
  async countDocuments(query = {}) {
    return new Promise((res, rej) =>
      this.ds.count(query, (err, count) => (err ? rej(err) : res(count)))
    );
  }

  // UPDATE
  async findByIdAndUpdate(id, update, options = {}) {
    const setData = update.$set || update;
    const updateOp = update.$push
      ? { $set: { ...setData, updatedAt: new Date() }, $push: update.$push }
      : { $set: { ...setData, updatedAt: new Date() } };

    return new Promise((res, rej) =>
      this.ds.update({ _id: id }, updateOp, { returnUpdatedDocs: true }, (err, _, doc) =>
        err ? rej(err) : res(doc)
      )
    );
  }

  async updateOne(query, update) {
    const setData = update.$set || update;
    return new Promise((res, rej) =>
      this.ds.update(query, { $set: { ...setData, updatedAt: new Date() } }, {}, (err, n) =>
        err ? rej(err) : res({ modifiedCount: n })
      )
    );
  }

  async updateMany(query, update) {
    const setData = update.$set || update;
    return new Promise((res, rej) =>
      this.ds.update(query, { $set: { ...setData, updatedAt: new Date() } }, { multi: true }, (err, n) =>
        err ? rej(err) : res({ modifiedCount: n })
      )
    );
  }

  // DELETE
  async findByIdAndDelete(id) {
    return new Promise((res, rej) =>
      this.ds.remove({ _id: id }, {}, (err, n) => (err ? rej(err) : res({ deletedCount: n })))
    );
  }

  async deleteMany(query = {}) {
    return new Promise((res, rej) =>
      this.ds.remove(query, { multi: true }, (err, n) => (err ? rej(err) : res({ deletedCount: n })))
    );
  }
}

// ─── Mode B: Serverless Vercel KV + In-Memory NeDB Model Wrapper ─────────────
class KVModel {
  constructor(collectionName, defaults = {}) {
    this.collectionName = collectionName;
    this.defaults = defaults;
    this.ds = new Datastore({ inMemoryOnly: true });
    this.loaded = false;
    this.loadPromise = null;
  }

  async ensureLoaded() {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const { kv } = require('@vercel/kv');
        const data = await kv.hgetall(`anirescue:${this.collectionName}`);
        if (data) {
          const docs = [];
          for (const key in data) {
            try {
              const doc = typeof data[key] === 'string' ? JSON.parse(data[key]) : data[key];
              docs.push(doc);
            } catch (e) {
              console.error(`Error parsing document ${key} in ${this.collectionName}:`, e);
            }
          }
          if (docs.length > 0) {
            await new Promise((res, rej) => {
              this.ds.insert(docs, (err) => (err ? rej(err) : res()));
            });
          }
        }
        this.loaded = true;
        console.log(`💾 Loaded collection '${this.collectionName}' from Vercel KV (${this.ds.getAllData().length} docs).`);
      } catch (err) {
        console.error(`❌ Failed to load collection '${this.collectionName}' from Vercel KV:`, err);
      }
    })();

    return this.loadPromise;
  }

  async persist(doc) {
    try {
      const { kv } = require('@vercel/kv');
      const key = `anirescue:${this.collectionName}`;
      await kv.hset(key, { [doc._id]: JSON.stringify(doc) });
    } catch (err) {
      console.error(`❌ Failed to persist doc ${doc._id} to Vercel KV:`, err);
    }
  }

  async persistMany(docs) {
    try {
      const { kv } = require('@vercel/kv');
      const key = `anirescue:${this.collectionName}`;
      const fields = {};
      docs.forEach(doc => {
        fields[doc._id] = JSON.stringify(doc);
      });
      if (Object.keys(fields).length > 0) {
        await kv.hset(key, fields);
      }
    } catch (err) {
      console.error(`❌ Failed to persist many docs to Vercel KV:`, err);
    }
  }

  async removePersisted(id) {
    try {
      const { kv } = require('@vercel/kv');
      const key = `anirescue:${this.collectionName}`;
      await kv.hdel(key, id);
    } catch (err) {
      console.error(`❌ Failed to delete doc ${id} from Vercel KV:`, err);
    }
  }

  async removePersistedMany(ids) {
    try {
      const { kv } = require('@vercel/kv');
      const key = `anirescue:${this.collectionName}`;
      if (ids.length > 0) {
        await kv.hdel(key, ...ids);
      }
    } catch (err) {
      console.error(`❌ Failed to delete many docs from Vercel KV:`, err);
    }
  }

  _applyDefaults(data) {
    const doc = {
      _id: data._id || uuidv4().replace(/-/g, '').substring(0, 16),
      ...this.defaults,
      ...data,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date()
    };
    return doc;
  }

  // INSERT
  async create(data) {
    await this.ensureLoaded();
    const doc = this._applyDefaults(data);
    const newDoc = await new Promise((res, rej) =>
      this.ds.insert(doc, (err, inserted) => (err ? rej(err) : res(inserted)))
    );
    await this.persist(newDoc);
    return newDoc;
  }

  async insertMany(docs) {
    await this.ensureLoaded();
    const withDefaults = docs.map((d) => this._applyDefaults(d));
    const newDocs = await new Promise((res, rej) =>
      this.ds.insert(withDefaults, (err, inserted) => (err ? rej(err) : res(inserted)))
    );
    await this.persistMany(newDocs);
    return newDocs;
  }

  // FIND
  async find(query = {}, projection = {}) {
    await this.ensureLoaded();
    return new Promise((res, rej) =>
      this.ds.find(query, (err, docs) => (err ? rej(err) : res(docs)))
    );
  }

  async findOne(query = {}) {
    await this.ensureLoaded();
    return new Promise((res, rej) =>
      this.ds.findOne(query, (err, doc) => (err ? rej(err) : res(doc)))
    );
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async findWithOptions(query = {}, { sort = {}, skip = 0, limit = 0 } = {}) {
    await this.ensureLoaded();
    return new Promise((res, rej) => {
      let cursor = this.ds.find(query);
      if (Object.keys(sort).length) cursor = cursor.sort(sort);
      if (skip) cursor = cursor.skip(skip);
      if (limit) cursor = cursor.limit(limit);
      cursor.exec((err, docs) => (err ? rej(err) : res(docs)));
    });
  }

  // COUNT
  async countDocuments(query = {}) {
    await this.ensureLoaded();
    return new Promise((res, rej) =>
      this.ds.count(query, (err, count) => (err ? rej(err) : res(count)))
    );
  }

  // UPDATE
  async findByIdAndUpdate(id, update, options = {}) {
    await this.ensureLoaded();
    const setData = update.$set || update;
    const updateOp = update.$push
      ? { $set: { ...setData, updatedAt: new Date() }, $push: update.$push }
      : { $set: { ...setData, updatedAt: new Date() } };

    const updatedDoc = await new Promise((res, rej) =>
      this.ds.update({ _id: id }, updateOp, { returnUpdatedDocs: true }, (err, _, doc) =>
        err ? rej(err) : res(doc)
      )
    );
    if (updatedDoc) {
      await this.persist(updatedDoc);
    }
    return updatedDoc;
  }

  async updateOne(query, update) {
    await this.ensureLoaded();
    const setData = update.$set || update;
    const updateOp = update.$push
      ? { $set: { ...setData, updatedAt: new Date() }, $push: update.$push }
      : { $set: { ...setData, updatedAt: new Date() } };

    return new Promise((res, rej) =>
      this.ds.update(query, updateOp, { multi: false, returnUpdatedDocs: true }, async (err, numAffected, affectedDocs) => {
        if (err) return rej(err);
        if (affectedDocs) {
          const doc = Array.isArray(affectedDocs) ? affectedDocs[0] : affectedDocs;
          if (doc) await this.persist(doc);
        }
        res({ modifiedCount: numAffected });
      })
    );
  }

  async updateMany(query, update) {
    await this.ensureLoaded();
    const setData = update.$set || update;
    const updateOp = update.$push
      ? { $set: { ...setData, updatedAt: new Date() }, $push: update.$push }
      : { $set: { ...setData, updatedAt: new Date() } };

    return new Promise((res, rej) =>
      this.ds.update(query, updateOp, { multi: true, returnUpdatedDocs: true }, async (err, numAffected, affectedDocs) => {
        if (err) return rej(err);
        if (affectedDocs && Array.isArray(affectedDocs)) {
          await this.persistMany(affectedDocs);
        }
        res({ modifiedCount: numAffected });
      })
    );
  }

  // DELETE
  async findByIdAndDelete(id) {
    await this.ensureLoaded();
    const res = await new Promise((res, rej) =>
      this.ds.remove({ _id: id }, {}, (err, n) => (err ? rej(err) : res({ deletedCount: n })))
    );
    await this.removePersisted(id);
    return res;
  }

  async deleteMany(query = {}) {
    await this.ensureLoaded();
    const docsToDelete = await this.find(query);
    const ids = docsToDelete.map(d => d._id);
    
    const res = await new Promise((res, rej) =>
      this.ds.remove(query, { multi: true }, (err, n) => (err ? rej(err) : res({ deletedCount: n })))
    );
    
    if (ids.length > 0) {
      await this.removePersistedMany(ids);
    }
    return res;
  }
}

// Export wrapped model instances based on active connection mode
module.exports = {
  db,
  Model,
  KVModel,
  Users:      useKV ? new KVModel('users') : new Model(db.users),
  Reports:    useKV ? new KVModel('reports') : new Model(db.reports),
  Shelters:   useKV ? new KVModel('shelters') : new Model(db.shelters),
  Volunteers: useKV ? new KVModel('volunteers') : new Model(db.volunteers),
  Adoptions:  useKV ? new KVModel('adoptions') : new Model(db.adoptions),
  ChatLogs:   useKV ? new KVModel('chatlogs') : new Model(db.chatlogs),
};
