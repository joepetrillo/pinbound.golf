# Drizzle and Neon database guide

_Last updated: August 12, 2026_

This document explains how Drizzle ORM connects to Neon in this project, why the connection transport affects transaction support, and which setup an agent should choose when implementing database work.

## Project status

At the time this document was written:

- The project uses `drizzle-orm@1.0.0-rc.4`.
- The project uses `pg` through Drizzle's `node-postgres` adapter.
- The project uses `@vercel/functions` to attach the application-side pool to the Vercel Fluid lifecycle.
- `DATABASE_URL` is already validated as a server-only variable in `src/env.config.ts`.
- `DATABASE_URL` uses Neon's pooled hostname, which contains `-pooler`.
- `src/data/db.ts` provides full interactive Drizzle transactions over a module-global TCP pool:

```ts
import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import env from "@/env.config";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  idleTimeoutMillis: 5_000,
  max: 2,
});

attachDatabasePool(pool);

export const db = drizzle({ client: pool });
```

The application uses Next.js's Node.js runtime: Node.js is the Next.js 16 default, no route opts into the deprecated Edge runtime, and this project's `cacheComponents: true` configuration requires Node.js.

The root `vercel.json` sets `"fluid": true`, making Fluid Compute explicit for deployments from this repository instead of relying on a dashboard default. Fluid remains a Vercel project/deployment setting rather than a Next.js setting.

Do not inspect or read an environment file when working on this setup. Import the validated configuration from `@/env.config`.

## Mental model

The database stack has several independent layers:

```text
Application server code
  -> Drizzle ORM and query builder
    -> Drizzle connection adapter
      -> PostgreSQL driver and network transport
        -> Neon proxy and optional server-side pooler
          -> Neon-hosted PostgreSQL
```

### Neon

Neon hosts the PostgreSQL database. It is still PostgreSQL; Neon adds infrastructure such as autoscaling, connection proxies, and managed connection pooling.

### Drizzle ORM

The `drizzle-orm` package builds typed SQL queries, maps results, and exposes APIs such as `select`, `insert`, `update`, and `transaction`. It does not establish a network connection by itself. A Drizzle adapter delegates query execution to a database driver.

The following names are export paths within `drizzle-orm`, not separate npm packages:

- `drizzle-orm/neon-http`
- `drizzle-orm/neon-serverless`
- `drizzle-orm/node-postgres`

### Neon serverless driver

`@neondatabase/serverless` is an npm package owned by Neon. The word "serverless" is part of the package name; it is not a Drizzle package.

It offers two ways to communicate with Neon:

- `neon(url)` sends queries using HTTP `fetch`.
- `Pool` and `Client` communicate using WebSockets and maintain a database session.

Drizzle connects to those two modes using different adapters:

| Drizzle adapter | Underlying driver | Transport | Interactive transactions |
| --- | --- | --- | --- |
| `drizzle-orm/neon-http` | Neon `neon()` | HTTP | No |
| `drizzle-orm/neon-serverless` | Neon `Pool` or `Client` | WebSocket | Yes |
| `drizzle-orm/node-postgres` | `pg.Pool` | PostgreSQL over TCP | Yes |

### Pooled Neon URL

A Neon hostname containing `-pooler` routes connections through Neon's server-side PgBouncer. This is independent of the application driver and independent of whether the application uses HTTP, WebSockets, or TCP.

Neon's PgBouncer uses transaction pooling. It assigns a PostgreSQL connection for the duration of a transaction, then returns it to the pool after `COMMIT` or `ROLLBACK`. Therefore, a pooled Neon URL supports ordinary interactive transactions.

The pooled URL does not preserve session state across separate transactions. Features such as persistent `SET`, `LISTEN`/`NOTIFY`, session-level advisory locks, and some administrative operations require a direct connection. Schema migrations should generally use a separate direct URL.

## Two kinds of transaction

Both transaction styles below are real PostgreSQL transactions. The difference is whether application code can run between statements while the transaction remains open.

### Non-interactive transaction

All statements are constructed before they are sent. Drizzle's Neon HTTP adapter exposes this through `db.batch()`:

```ts
const orderId = crypto.randomUUID();

const [createdOrder, updatedInventory] = await db.batch([
  db
    .insert(orders)
    .values({ id: orderId, customerId })
    .returning({ id: orders.id }),
  db
    .update(inventory)
    .set({ quantity: sql`${inventory.quantity} - 1` })
    .where(eq(inventory.sku, sku)),
]);
```

The statements execute in order and all commit or all roll back. A later SQL statement can observe an earlier statement's writes. However, JavaScript cannot inspect the first result before deciding whether to construct or execute the second statement.

This is often sufficient when the application can:

- Generate identifiers before executing the batch.
- Express dependencies with a SQL CTE or subquery.
- Rely on database constraints and atomic SQL updates.
- Determine every statement before sending the request.

### Interactive transaction

An interactive transaction keeps one session open while application code executes:

```text
BEGIN
  -> execute query
  -> inspect its result in JavaScript
  -> branch or validate
  -> execute another query
COMMIT or ROLLBACK
```

This is Drizzle's standard callback API:

```ts
const order = await db.transaction(async (tx) => {
  const [createdOrder] = await tx
    .insert(orders)
    .values({ customerId })
    .returning({ id: orders.id });

  if (!createdOrder) {
    tx.rollback();
  }

  await tx.insert(orderItems).values({
    orderId: createdOrder.id,
    productId,
    quantity,
  });

  return createdOrder;
});
```

For every operation that must participate in the transaction, use `tx`, not the outer `db` instance.

- Returning from the callback commits the transaction.
- Throwing an error rolls it back automatically.
- Calling `tx.rollback()` explicitly rolls it back by throwing Drizzle's rollback error.
- A nested `tx.transaction()` uses a savepoint when the selected driver supports it.

## Important Neon HTTP limitation

`drizzle-orm/neon-http` cannot keep a session open while arbitrary JavaScript executes, so it cannot implement the interactive callback shown above.

With the currently installed Drizzle release, `db.transaction(async (tx) => ...)` can appear in the inherited TypeScript API, but the Neon HTTP adapter throws `No transactions support in neon-http driver` at runtime. Do not call it from an HTTP-backed `db` instance.

Also do not issue separate HTTP calls for `BEGIN`, application queries, and `COMMIT`. Separate HTTP requests are not guaranteed to use the same PostgreSQL session.

Use `db.batch()` for an atomic, predeclared transaction. Switch to a session-capable adapter when JavaScript must inspect intermediate results, conditionally issue another query, use explicit rollback, or use savepoints.

## Recommended interactive setup for this project

For the default Next.js Node.js runtime on Vercel Fluid Compute, prefer the standard `pg` TCP driver with Drizzle's `node-postgres` adapter. This is Neon's current recommendation for Vercel Fluid because warm function instances can safely reuse a connection pool. It supports the complete Drizzle transaction API.

This recommendation has four separate pieces:

1. `drizzle-orm@rc` provides the current Drizzle v1 ORM and `node-postgres` adapter.
2. `pg.Pool` provides a reusable application-side TCP connection pool.
3. The pooled Neon `DATABASE_URL` routes those connections through Neon's server-side PgBouncer.
4. `attachDatabasePool(pool)` integrates the application-side pool with Vercel Fluid's suspension lifecycle.

`attachDatabasePool` is not required for Drizzle to build queries, and it is not what makes transactions atomic. A `pg.Pool` will execute queries without it. It **is the supported Vercel Fluid setup for a module-global pool** because it keeps the instance alive long enough for the pool's idle timeout to close unused clients before suspension. Omitting it can leave idle clients attached to Neon until a later server-side timeout.

Do not use `attachDatabasePool` with a `neon-http` client; there is no application-side `pg.Pool` to attach. This project uses it because its runtime client is `node-postgres`.

Install the runtime and type packages:

```sh
bun add pg @vercel/functions
bun add --dev @types/pg
```

The installed client in `src/data/db.ts` has this shape:

```ts
import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import env from "@/env.config";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  idleTimeoutMillis: 5_000,
  max: 2,
});

attachDatabasePool(pool);

export const db = drizzle({ client: pool });
```

Keep the pooled Neon `DATABASE_URL`. There are now two complementary pools:

1. `pg.Pool` is the application-side pool reused by a warm Node.js instance.
2. The `-pooler` hostname routes connections through Neon's server-side PgBouncer.

`attachDatabasePool(pool)` lets Vercel manage idle connection cleanup before a Fluid function instance is suspended.

Create and attach the pool once at module scope, immediately after construction. Do not construct a pool inside a Server Action, Server Component, query function, or Route Handler. Drizzle returns a checked-out client to the pool when a transaction completes.

Vercel recommends a relatively short idle timeout such as five seconds and warns against `max: 1`, because Fluid can run concurrent invocations in one instance. Neon recommends keeping per-instance pools small to limit connection storms as instances scale out. This project starts at `max: 2`, which permits concurrency while keeping the per-instance footprint conservative. Tune it only from observed request concurrency, query latency, and Neon pooler metrics.

`@neondatabase/serverless` is not a direct project dependency, and no application code imports it. Bun may still install it as an optional peer dependency of Drizzle; that does not change the runtime setup described here.

## WebSocket alternative

When TCP is unavailable but interactive transactions are required, use Neon's WebSocket driver with `drizzle-orm/neon-serverless`:

```ts
import "server-only";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import env from "@/env.config";

export const db = drizzle({
  connection: env.DATABASE_URL,
  ws,
});
```

In a Node.js runtime, the Drizzle guide requires the `ws` and `bufferutil` packages for this setup. In Edge or classic serverless environments, follow Neon's lifecycle guidance: a WebSocket `Pool` or `Client` may need to be created, used, and closed within one request rather than stored globally.

Prefer `node-postgres` for this project's normal Node.js/Vercel Fluid deployment. Reserve the WebSocket approach for a runtime where TCP is unavailable or where platform constraints specifically favor it.

## Decision table

| Requirement | Recommended setup |
| --- | --- |
| One ordinary query | `neon-http` is sufficient |
| Several atomic statements known in advance | `neon-http` with `db.batch()` |
| Inspect query 1 in JavaScript before deciding on query 2 | `node-postgres` with `db.transaction()` |
| Explicit rollback or nested savepoints | `node-postgres` with `db.transaction()` |
| Node.js on Vercel Fluid | `node-postgres` plus `attachDatabasePool()` |
| Edge or worker runtime without TCP, interactive transaction required | Neon WebSockets with `neon-serverless` |
| Schema migrations or session-dependent administration | A direct Neon URL, separate from the pooled runtime URL |

## Project placement rules

- Keep the shared, secret-backed client in `src/data/db.ts`.
- Keep `import "server-only"` at the top of the client module.
- Read the connection string through `@/env.config`; do not read an environment file.
- Put domain reads in `src/features/<domain>/<domain>-queries.ts` and mark those modules `server-only`.
- Put mutations in feature-owned Server Action or delivery modules and keep transaction boundaries close to the business operation they protect.
- Return minimal serializable DTOs across Server-to-Client boundaries rather than exposing ORM rows indiscriminately.

## Official references

- [Drizzle v1 upgrade guide](https://orm.drizzle.team/docs/upgrade-v1)
- [Drizzle and Neon connection guide](https://orm.drizzle.team/docs/connect-neon)
- [Drizzle transaction API](https://orm.drizzle.team/docs/transactions)
- [Drizzle Batch API](https://orm.drizzle.team/docs/batch-api)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon connection methods on Vercel](https://neon.com/docs/guides/vercel-connection-methods)
- [Neon serverless connection-storm guidance](https://neon.com/docs/guides/serverless-connection-pooling)
- [Vercel connection pooling with Fluid Compute](https://vercel.com/kb/guide/connection-pooling-with-functions)
- [Vercel `attachDatabasePool` API](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#attachdatabasepool)
- [Vercel Fluid Compute configuration](https://vercel.com/docs/fluid-compute)
