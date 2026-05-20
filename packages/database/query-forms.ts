import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./env";
import { formsTable, usersTable, responsesTable } from "./schema";
import { eq, and, desc } from "drizzle-orm";

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const db = drizzle(client);

  console.log("=== EXECUTING LISTPUBLIC QUERY ===");
  const publicForms = await db
    .select({
      id: formsTable.id,
      title: formsTable.title,
      description: formsTable.description,
      slug: formsTable.slug,
      theme: formsTable.theme,
      createdAt: formsTable.createdAt,
      creatorName: usersTable.fullName,
    })
    .from(formsTable)
    .innerJoin(usersTable, eq(formsTable.userId, usersTable.id))
    .where(
      and(
        eq(formsTable.visibility, "public"),
        eq(formsTable.status, "published")
      )
    )
    .orderBy(desc(formsTable.createdAt));

  console.log("Returned forms count:", publicForms.length);
  console.log("Forms list:", publicForms);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
