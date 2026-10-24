/**
 * One-time: rewrite stored file URLs after moving to a new bucket / domain.
 * Scans every collection and every field (including nested objects/arrays),
 * replacing strings that start with OLD_BASE with NEW_BASE.
 *
 * Dry run (default, no writes):
 *   node scripts/migrate-file-urls.js <OLD_BASE> <NEW_BASE>
 * Apply changes:
 *   node scripts/migrate-file-urls.js <OLD_BASE> <NEW_BASE> --apply
 *
 * Example:
 *   node scripts/migrate-file-urls.js https://old-bucket.s3.ap-south-1.amazonaws.com https://new-bucket.s3.ap-south-1.amazonaws.com --apply
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const [, , oldArg, newArg, flag] = process.argv;
const APPLY = flag === '--apply';

if (!oldArg || !newArg) {
  console.error('Usage: node scripts/migrate-file-urls.js <OLD_BASE> <NEW_BASE> [--apply]');
  process.exit(1);
}

const OLD_BASE = oldArg.replace(/\/+$/, '');
const NEW_BASE = newArg.replace(/\/+$/, '');

// Returns { value, changed } with every matching string rewritten.
const rewrite = (value) => {
  if (typeof value === 'string') {
    return value.startsWith(OLD_BASE)
      ? { value: NEW_BASE + value.slice(OLD_BASE.length), changed: 1 }
      : { value, changed: 0 };
  }
  if (Array.isArray(value)) {
    let changed = 0;
    const out = value.map((v) => {
      const r = rewrite(v);
      changed += r.changed;
      return r.value;
    });
    return { value: out, changed };
  }
  if (
    value &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    !(value instanceof mongoose.Types.ObjectId) &&
    !Buffer.isBuffer(value) &&
    value._bsontype === undefined
  ) {
    let changed = 0;
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const r = rewrite(v);
      changed += r.changed;
      out[k] = r.value;
    }
    return { value: out, changed };
  }
  return { value, changed: 0 };
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'}: ${OLD_BASE} -> ${NEW_BASE}`);
  let totalDocs = 0;
  let totalUrls = 0;

  for (const { name } of collections) {
    if (name.startsWith('system.')) continue;
    const col = db.collection(name);
    let docs = 0;
    let urls = 0;

    for await (const doc of col.find({})) {
      const { _id, ...rest } = doc;
      const { value, changed } = rewrite(rest);
      if (!changed) continue;
      docs += 1;
      urls += changed;
      if (APPLY) await col.replaceOne({ _id }, { _id, ...value });
    }

    if (docs) console.log(`${name}: ${docs} doc(s), ${urls} URL(s)`);
    totalDocs += docs;
    totalUrls += urls;
  }

  console.log(`Done. ${totalDocs} doc(s), ${totalUrls} URL(s) ${APPLY ? 'updated' : 'would be updated'}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
