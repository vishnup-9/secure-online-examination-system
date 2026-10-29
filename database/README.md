MongoDB is schemaless — there is no SQL migration folder to run.

All Mongoose schemas live in `server/src/models/` and are created
automatically the first time each collection is written to.

To populate demo data, run `npm run seed` from the `server/` directory
(see the root README, section 5).
