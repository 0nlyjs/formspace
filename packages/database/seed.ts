import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import { env } from "./env";
import { usersTable, formsTable, fieldsTable, responsesTable } from "./schema";

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
});

async function main() {
  console.log("Connecting to PostgreSQL...");
  await client.connect();
  const db = drizzle(client);

  console.log("Clearing existing data...");
  await db.delete(responsesTable);
  await db.delete(fieldsTable);
  await db.delete(formsTable);
  await db.delete(usersTable);

  console.log("Seeding admin demo account...");
  const hashedPassword = await bcrypt.hash("mist@2434", 10);
  const [admin] = await db
    .insert(usersTable)
    .values({
      fullName: "Formspace Judge",
      email: "test@mistjs.com",
      passwordHash: hashedPassword,
      emailVerified: true,
    })
    .returning();

  if (!admin) {
    throw new Error("Failed to create admin user");
  }
  console.log(`Seeded User: ${admin.email} (Password: mist@2434)`);

  // ==========================================
  // FORM 1: Anime & Manga Explorer (Theme: anime, Visibility: public)
  // ==========================================
  console.log("Seeding Anime & Manga Explorer form...");
  const [animeForm] = await db
    .insert(formsTable)
    .values({
      userId: admin.id,
      title: "Anime & Manga Explorer",
      description: "Discover community tastes in animation quality, titles, and characters.",
      slug: "anime-survey",
      theme: "pure abstract",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!animeForm) throw new Error("Failed to create animeForm");

  const animeFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: animeForm.id,
        type: "single_select",
        label: "What is your favorite anime of all time?",
        required: true,
        options: ["One Piece", "Naruto", "Attack on Titan", "Demon Slayer", "Jujutsu Kaisen"],
        order: 0,
      },
      {
        formId: animeForm.id,
        type: "rating",
        label: "How would you rate recent anime animation quality?",
        required: true,
        order: 1,
      },
      {
        formId: animeForm.id,
        type: "long_text",
        label: "What is your favorite character and why?",
        required: false,
        placeholder: "Tell us about their design, personality, or backstory...",
        order: 2,
      },
      {
        formId: animeForm.id,
        type: "checkbox",
        label: "Would you like to receive weekly anime recommendations?",
        required: false,
        options: ["Yes, send them!", "No, I'm good"],
        order: 3,
      },
    ])
    .returning();

  // Seed 18 Responses for Anime Form
  console.log("Seeding responses for Anime Form...");
  const animeAnswersList = [
    {
      fav: "Attack on Titan",
      rate: "5",
      char: "Eren Yeager is so complex. The transition from hero to villain is peak writing.",
      rec: "Yes, send them!",
    },
    {
      fav: "One Piece",
      rate: "4",
      char: "Luffy because of his absolute freedom and Gear 5 animation!",
      rec: "Yes, send them!",
    },
    {
      fav: "Naruto",
      rate: "3",
      char: "Kakashi. His quiet strength and tragic backstory are unmatched.",
      rec: "No, I'm good",
    },
    {
      fav: "Demon Slayer",
      rate: "5",
      char: "Zenitsu. When he falls asleep and fights, the Ufotable animation is crazy.",
      rec: "Yes, send them!",
    },
    {
      fav: "Jujutsu Kaisen",
      rate: "4",
      char: "Gojo Satoru. Literally the coolest character ever designed.",
      rec: "Yes, send them!",
    },
    {
      fav: "Attack on Titan",
      rate: "5",
      char: "Levi Ackerman. The battle scenes are outstanding.",
      rec: "No, I'm good",
    },
  ];

  for (let i = 0; i < 18; i++) {
    const template = animeAnswersList[i % animeAnswersList.length]!;
    const answers: Record<string, any> = {};
    answers[animeFields[0]!.id] = template.fav;
    answers[animeFields[1]!.id] = Number(template.rate) - (i % 2); // vary the rating
    answers[animeFields[2]!.id] = template.char;
    answers[animeFields[3]!.id] = template.rec;

    // Distribute submissions over last 7 days
    const submittedAt = new Date();
    submittedAt.setDate(submittedAt.getDate() - (i % 7));

    await db.insert(responsesTable).values({
      formId: animeForm.id,
      answers,
      ipAddress: `192.168.1.${10 + i}`,
      submittedAt,
    });
  }

  // ==========================================
  // FORM 2: Cyberpunk OS Survey (Theme: tech, Visibility: public)
  // ==========================================
  console.log("Seeding Cyberpunk OS Survey form...");
  const [techForm] = await db
    .insert(formsTable)
    .values({
      userId: admin.id,
      title: "Cyberpunk Developer OS Survey",
      description: "Explore the ultimate neon grids, host terminal preferences, and modern package compilers.",
      slug: "tech-os-survey",
      theme: "pure abstract",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!techForm) throw new Error("Failed to create techForm");

  const techFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: techForm.id,
        type: "single_select",
        label: "Which primary operating system do you use for terminal coding?",
        required: true,
        options: ["MacOS", "Linux", "Windows / WSL"],
        order: 0,
      },
      {
        formId: techForm.id,
        type: "single_select",
        label: "What shell interface do you run?",
        required: true,
        options: ["zsh", "bash", "fish"],
        order: 1,
      },
      {
        formId: techForm.id,
        type: "single_select",
        label: "What is your primary editor choice?",
        required: true,
        options: ["VS Code", "NeoVim", "Zed", "Cursor"],
        order: 2,
      },
    ])
    .returning();

  // Seed 12 Responses for Tech Form
  console.log("Seeding responses for Tech Form...");
  const techAnswersList = [
    { os: "MacOS", shell: "zsh", editor: "Cursor" },
    { os: "Linux", shell: "bash", editor: "NeoVim" },
    { os: "Windows / WSL", shell: "zsh", editor: "VS Code" },
    { os: "MacOS", shell: "fish", editor: "Zed" },
    { os: "Linux", shell: "fish", editor: "NeoVim" },
    { os: "MacOS", shell: "zsh", editor: "VS Code" },
  ];

  for (let i = 0; i < 12; i++) {
    const template = techAnswersList[i % techAnswersList.length]!;
    const answers: Record<string, any> = {};
    answers[techFields[0]!.id] = template.os;
    answers[techFields[1]!.id] = template.shell;
    answers[techFields[2]!.id] = template.editor;

    const submittedAt = new Date();
    submittedAt.setDate(submittedAt.getDate() - (i % 5));

    await db.insert(responsesTable).values({
      formId: techForm.id,
      answers,
      ipAddress: `10.0.0.${100 + i}`,
      submittedAt,
    });
  }

  // ==========================================
  // FORM 3: Retro Games & Sci-Fi Movies (Theme: retro, Visibility: public)
  // ==========================================
  console.log("Seeding Retro Games & Sci-Fi Movies form...");
  const [retroForm] = await db
    .insert(formsTable)
    .values({
      userId: admin.id,
      title: "Retro Games & Sci-Fi Trivia",
      description: "A nostalgic portal to pixel platforms and interstellar space travel.",
      slug: "retro-sci-fi",
      theme: "pure abstract",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!retroForm) throw new Error("Failed to create retroForm");

  const retroFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: retroForm.id,
        type: "rating",
        label: "Rate your excitement level for 8-bit / 16-bit retro platforms:",
        required: true,
        order: 0,
      },
      {
        formId: retroForm.id,
        type: "multi_select",
        label: "Select classic Sci-Fi franchises that you adore:",
        required: true,
        options: ["Star Wars", "Star Trek", "The Matrix", "Blade Runner", "Dune"],
        order: 1,
      },
      {
        formId: retroForm.id,
        type: "short_text",
        label: "What was the first gaming console you owned?",
        required: false,
        placeholder: "e.g. NES, Sega Genesis, Gameboy...",
        order: 2,
      },
    ])
    .returning();

  // Seed 22 Responses for Retro Form
  console.log("Seeding responses for Retro Form...");
  const retroAnswersList = [
    { rate: "5", fran: ["Star Wars", "Blade Runner"], console: "Sega Genesis" },
    { rate: "4", fran: ["The Matrix", "Blade Runner", "Dune"], console: "Gameboy Color" },
    { rate: "5", fran: ["Star Trek", "The Matrix"], console: "NES" },
    { rate: "3", fran: ["Dune"], console: "PlayStation 1" },
    { rate: "5", fran: ["Star Wars", "Star Trek", "The Matrix", "Blade Runner", "Dune"], console: "Super Nintendo" },
  ];

  for (let i = 0; i < 22; i++) {
    const template = retroAnswersList[i % retroAnswersList.length]!;
    const answers: Record<string, any> = {};
    answers[retroFields[0]!.id] = Number(template.rate);
    answers[retroFields[1]!.id] = template.fran;
    answers[retroFields[2]!.id] = template.console;

    const submittedAt = new Date();
    submittedAt.setDate(submittedAt.getDate() - (i % 7));

    await db.insert(responsesTable).values({
      formId: retroForm.id,
      answers,
      ipAddress: `172.16.0.${50 + i}`,
      submittedAt,
    });
  }

  console.log("Database seeded successfully! ✅");
  await client.end();
}

main().catch((err) => {
  console.error("Seeding failed: ", err);
  client.end();
  process.exit(1);
});
