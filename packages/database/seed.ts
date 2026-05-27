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

  console.log("Seeding demo account with username 'demo'...");
  const hashedPassword = await bcrypt.hash("mist@2434", 10);
  const [demoUser] = await db
    .insert(usersTable)
    .values({
      fullName: "demo",
      email: "test@mistjs.com",
      passwordHash: hashedPassword,
      emailVerified: true,
    })
    .returning();

  if (!demoUser) {
    throw new Error("Failed to create demo user");
  }
  console.log(`Seeded User: ${demoUser.fullName} (${demoUser.email} / Password: mist@2434)`);

  // Helper to get random date within last 7 days
  const getRandomDateWithinWeek = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (index % 7));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    return date;
  };

  // ==========================================
  // FORM 1: Tech Trends Survey (Theme: tech, Visibility: public)
  // ==========================================
  console.log("Seeding Form 1: Tech...");
  const [techForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "Next-Gen Developer Tech Survey",
      description: "Discover community tastes in modern runtime platforms, development tools, and artificial intelligence.",
      slug: "tech-survey",
      theme: "tech",
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
        label: "What is your primary development stack?",
        required: true,
        options: ["Frontend (React/Vue/Next)", "Backend (Node/Go/Python)", "Fullstack", "DevOps & Cloud Engineer"],
        order: 0,
      },
      {
        formId: techForm.id,
        type: "rating",
        label: "How would you rate recent AI code generation tools (e.g. Copilot, Cursor)?",
        required: true,
        order: 1,
      },
      {
        formId: techForm.id,
        type: "checkbox",
        label: "Which technologies are you planning to adopt next?",
        required: false,
        options: ["Rust / WebAssembly", "Kubernetes & Docker", "Vector Databases", "WebGPU rendering"],
        order: 2,
      },
    ])
    .returning();

  // Seed Responses for Tech Form
  console.log("Seeding responses for Tech Form...");
  const techOptions = [
    { stack: "Fullstack", rate: 5, tech: ["Vector Databases", "WebGPU rendering"] },
    { stack: "Frontend (React/Vue/Next)", rate: 4, tech: ["Rust / WebAssembly"] },
    { stack: "Backend (Node/Go/Python)", rate: 5, tech: ["Vector Databases", "Kubernetes & Docker"] },
    { stack: "DevOps & Cloud Engineer", rate: 3, tech: ["Kubernetes & Docker"] },
    { stack: "Fullstack", rate: 4, tech: ["Rust / WebAssembly", "Vector Databases"] },
  ];

  for (let i = 0; i < 15; i++) {
    const template = techOptions[i % techOptions.length]!;
    const answers: Record<string, any> = {};
    answers[techFields[0]!.id] = template.stack;
    answers[techFields[1]!.id] = Math.min(5, Math.max(1, template.rate + (i % 2 === 0 ? 0 : -1)));
    answers[techFields[2]!.id] = template.tech;

    await db.insert(responsesTable).values({
      formId: techForm.id,
      answers,
      ipAddress: `192.168.1.${10 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  // ==========================================
  // FORM 2: Anime Survey (Theme: manga pop, Visibility: public)
  // ==========================================
  console.log("Seeding Form 2: Anime...");
  const [animeForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "Otaku Anime Preference Survey",
      description: "Discover community tastes in animation quality, titles, and characters.",
      slug: "anime-survey", // kept as anime-survey to retain fallback support
      theme: "manga pop",
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
        label: "What anime genre do you watch the most?",
        required: true,
        options: ["Shonen (Action)", "Seinen (Dark/Mature)", "Slice of Life / Comedy", "Isekai / Fantasy"],
        order: 0,
      },
      {
        formId: animeForm.id,
        type: "rating",
        label: "Rate the overall storytelling of modern anime titles:",
        required: true,
        order: 1,
      },
      {
        formId: animeForm.id,
        type: "long_text",
        label: "Which studio produces the best visual work?",
        required: false,
        placeholder: "e.g. Ufotable, MAPPA, Kyoto Animation...",
        order: 2,
      },
    ])
    .returning();

  const animeOptions = [
    { genre: "Shonen (Action)", rate: 5, studio: "Ufotable's Demon Slayer is absolutely state of the art visual work!" },
    { genre: "Seinen (Dark/Mature)", rate: 4, studio: "MAPPA does a stunning job with Jujutsu Kaisen and Chainsaw Man." },
    { genre: "Slice of Life / Comedy", rate: 5, studio: "Kyoto Animation has the absolute best visual fidelity and heart." },
    { genre: "Isekai / Fantasy", rate: 3, studio: "A-1 Pictures does a solid job with Solo Leveling." },
  ];

  for (let i = 0; i < 18; i++) {
    const template = animeOptions[i % animeOptions.length]!;
    const answers: Record<string, any> = {};
    answers[animeFields[0]!.id] = template.genre;
    answers[animeFields[1]!.id] = Math.min(5, Math.max(1, template.rate + (i % 3 === 0 ? 0 : -1)));
    answers[animeFields[2]!.id] = template.studio;

    await db.insert(responsesTable).values({
      formId: animeForm.id,
      answers,
      ipAddress: `192.168.2.${20 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  // ==========================================
  // FORM 3: Sports Fan Survey (Theme: fresh leaf, Visibility: public)
  // ==========================================
  console.log("Seeding Form 3: Sports...");
  const [sportsForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "Global Sports Fan Engagement",
      description: "Explore the excitement surrounding Formula 1, Premier League, NBA, and global sports streams.",
      slug: "sports-survey",
      theme: "fresh leaf",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!sportsForm) throw new Error("Failed to create sportsForm");

  const sportsFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: sportsForm.id,
        type: "single_select",
        label: "What is your absolute favorite sport to watch?",
        required: true,
        options: ["Football / Soccer", "Basketball (NBA)", "Tennis", "Formula 1", "Cricket"],
        order: 0,
      },
      {
        formId: sportsForm.id,
        type: "rating",
        label: "Rate the excitement of the latest season tournaments:",
        required: true,
        order: 1,
      },
      {
        formId: sportsForm.id,
        type: "checkbox",
        label: "How do you usually watch sports matches?",
        required: false,
        options: ["Live TV Cable", "Streaming Services", "Social Media clips", "In-person at stadiums"],
        order: 2,
      },
    ])
    .returning();

  const sportsOptions = [
    { sport: "Football / Soccer", rate: 5, watch: ["Streaming Services", "In-person at stadiums"] },
    { sport: "Basketball (NBA)", rate: 4, watch: ["Streaming Services", "Social Media clips"] },
    { sport: "Formula 1", rate: 5, watch: ["Live TV Cable", "Streaming Services"] },
    { sport: "Tennis", rate: 3, watch: ["Live TV Cable"] },
    { sport: "Cricket", rate: 4, watch: ["Streaming Services"] },
  ];

  for (let i = 0; i < 12; i++) {
    const template = sportsOptions[i % sportsOptions.length]!;
    const answers: Record<string, any> = {};
    answers[sportsFields[0]!.id] = template.sport;
    answers[sportsFields[1]!.id] = template.rate;
    answers[sportsFields[2]!.id] = template.watch;

    await db.insert(responsesTable).values({
      formId: sportsForm.id,
      answers,
      ipAddress: `192.168.3.${30 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  // ==========================================
  // FORM 4: Songs & Playlists Survey (Theme: retro, Visibility: public)
  // ==========================================
  console.log("Seeding Form 4: Song...");
  const [songForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "Music & Songs Playlist Trends",
      description: "Rate the obsession with nostalgic retro LPs, synthwave vibes, and modern playlists.",
      slug: "song-survey",
      theme: "retro",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!songForm) throw new Error("Failed to create songForm");

  const songFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: songForm.id,
        type: "single_select",
        label: "Which music genre dominates your daily playlist?",
        required: true,
        options: ["Synthwave / Lo-Fi", "Pop / Dance", "Indie / Alternative Rock", "Hip Hop / Rap", "Classical / Jazz"],
        order: 0,
      },
      {
        formId: songForm.id,
        type: "rating",
        label: "Rate your obsession level with modern LPs & Vinyl records:",
        required: true,
        order: 1,
      },
      {
        formId: songForm.id,
        type: "short_text",
        label: "Who is your go-to artist when you need to focus?",
        required: false,
        placeholder: "e.g. Hans Zimmer, Daft Punk, Lana Del Rey...",
        order: 2,
      },
    ])
    .returning();

  const songOptions = [
    { genre: "Synthwave / Lo-Fi", rate: 5, artist: "Daft Punk" },
    { genre: "Indie / Alternative Rock", rate: 4, artist: "Lana Del Rey" },
    { genre: "Classical / Jazz", rate: 5, artist: "Hans Zimmer" },
    { genre: "Hip Hop / Rap", rate: 2, artist: "Kendrick Lamar" },
    { genre: "Pop / Dance", rate: 3, artist: "Dua Lipa" },
  ];

  for (let i = 0; i < 16; i++) {
    const template = songOptions[i % songOptions.length]!;
    const answers: Record<string, any> = {};
    answers[songFields[0]!.id] = template.genre;
    answers[songFields[1]!.id] = template.rate;
    answers[songFields[2]!.id] = template.artist;

    await db.insert(responsesTable).values({
      formId: songForm.id,
      answers,
      ipAddress: `192.168.4.${40 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  // ==========================================
  // FORM 5: Sci-Fi Movies Survey (Theme: pure abstract, Visibility: public)
  // ==========================================
  console.log("Seeding Form 5: Sci-Fi Movies...");
  const [scifiForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "Interstellar Sci-Fi Cinema Survey",
      description: "Express your passion for interstellar spacetime portals, multiverse concepts, and cyborg worlds.",
      slug: "scifi-movie-survey",
      theme: "pure abstract",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!scifiForm) throw new Error("Failed to create scifiForm");

  const scifiFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: scifiForm.id,
        type: "single_select",
        label: "Which sci-fi concept fascinates you the most?",
        required: true,
        options: ["Time Travel & Multiverses", "AI Cybernetics & Androids", "Space Exploration & Alien Species", "Dystopian Future Cyberpunk"],
        order: 0,
      },
      {
        formId: scifiForm.id,
        type: "rating",
        label: "How would you rate the visual effects of modern Sci-Fi films?",
        required: true,
        order: 1,
      },
      {
        formId: scifiForm.id,
        type: "checkbox",
        label: "Select your favorite sci-fi movie directors:",
        required: false,
        options: ["Christopher Nolan", "Denis Villeneuve", "Ridley Scott", "The Wachowskis"],
        order: 2,
      },
    ])
    .returning();

  const scifiOptions = [
    { concept: "Space Exploration & Alien Species", rate: 5, directors: ["Christopher Nolan", "Denis Villeneuve"] },
    { concept: "Time Travel & Multiverses", rate: 4, directors: ["Christopher Nolan"] },
    { concept: "Dystopian Future Cyberpunk", rate: 5, directors: ["Ridley Scott", "The Wachowskis"] },
    { concept: "AI Cybernetics & Androids", rate: 3, directors: ["Ridley Scott"] },
  ];

  for (let i = 0; i < 20; i++) {
    const template = scifiOptions[i % scifiOptions.length]!;
    const answers: Record<string, any> = {};
    answers[scifiFields[0]!.id] = template.concept;
    answers[scifiFields[1]!.id] = template.rate;
    answers[scifiFields[2]!.id] = template.directors;

    await db.insert(responsesTable).values({
      formId: scifiForm.id,
      answers,
      ipAddress: `192.168.5.${50 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  // ==========================================
  // FORM 6: Marvel Universe Survey (Theme: manga pop, Visibility: public)
  // ==========================================
  console.log("Seeding Form 6: Marvel Movies...");
  const [marvelForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "MCU Infinity Saga & Beyond",
      description: "Vote for your favorite Avenger, rate CGI, and recall major battle scenes.",
      slug: "marvel-movie-survey",
      theme: "manga pop",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!marvelForm) throw new Error("Failed to create marvelForm");

  const marvelFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: marvelForm.id,
        type: "single_select",
        label: "Who is your favorite core Avenger?",
        required: true,
        options: ["Iron Man", "Captain America", "Thor", "Black Widow", "Hulk"],
        order: 0,
      },
      {
        formId: marvelForm.id,
        type: "rating",
        label: "Rate the VFX and CGI quality of recent Marvel movies (Phase 4 & 5):",
        required: true,
        order: 1,
      },
      {
        formId: marvelForm.id,
        type: "long_text",
        label: "What was the most memorable movie scene in the MCU?",
        required: false,
        placeholder: "e.g. The Avengers portal scene in Endgame...",
        order: 2,
      },
    ])
    .returning();

  const marvelOptions = [
    { avenger: "Iron Man", rate: 4, scene: "Iron Man saying 'I am Iron Man' and snapping his fingers in Endgame is cinematic history." },
    { avenger: "Captain America", rate: 5, scene: "Captain America catching Mjolnir and fighting Thanos in Endgame is pure hype!" },
    { avenger: "Thor", rate: 3, scene: "Thor's epic entry into the battle of Wakanda in Infinity War." },
    { avenger: "Black Widow", rate: 4, scene: "The emotional sacrifice scene between Natasha and Clint on Vormir." },
  ];

  for (let i = 0; i < 14; i++) {
    const template = marvelOptions[i % marvelOptions.length]!;
    const answers: Record<string, any> = {};
    answers[marvelFields[0]!.id] = template.avenger;
    answers[marvelFields[1]!.id] = template.rate;
    answers[marvelFields[2]!.id] = template.scene;

    await db.insert(responsesTable).values({
      formId: marvelForm.id,
      answers,
      ipAddress: `192.168.6.${60 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  // ==========================================
  // FORM 7: Automobile & EV Evolution (Theme: tech, Visibility: public)
  // ==========================================
  console.log("Seeding Form 7: Automobile...");
  const [autoForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "Automobile & EV Revolution",
      description: "Share your preferences on electric vehicles, performance brands, and structural charging networks.",
      slug: "automobile-survey",
      theme: "tech",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!autoForm) throw new Error("Failed to create autoForm");

  const autoFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: autoForm.id,
        type: "single_select",
        label: "What is your preference for your next vehicle purchase?",
        required: true,
        options: ["Pure Electric (EV)", "Plug-in Hybrid (PHEV)", "Traditional Petrol/Gasoline", "Performance Sports Car"],
        order: 0,
      },
      {
        formId: autoForm.id,
        type: "rating",
        label: "How would you rate the current EV charging infrastructure in your area?",
        required: true,
        order: 1,
      },
      {
        formId: autoForm.id,
        type: "checkbox",
        label: "Which automotive brands do you find most innovative?",
        required: false,
        options: ["Tesla", "Porsche", "Hyundai / Kia", "BMW", "Toyota"],
        order: 2,
      },
    ])
    .returning();

  const autoOptions = [
    { preference: "Pure Electric (EV)", rate: 3, brands: ["Tesla", "Porsche"] },
    { preference: "Plug-in Hybrid (PHEV)", rate: 4, brands: ["Toyota", "BMW"] },
    { preference: "Traditional Petrol/Gasoline", rate: 2, brands: ["Toyota", "Porsche"] },
    { preference: "Performance Sports Car", rate: 5, brands: ["Porsche", "BMW"] },
  ];

  for (let i = 0; i < 11; i++) {
    const template = autoOptions[i % autoOptions.length]!;
    const answers: Record<string, any> = {};
    answers[autoFields[0]!.id] = template.preference;
    answers[autoFields[1]!.id] = template.rate;
    answers[autoFields[2]!.id] = template.brands;

    await db.insert(responsesTable).values({
      formId: autoForm.id,
      answers,
      ipAddress: `192.168.7.${70 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  // ==========================================
  // FORM 8: Next-Gen Gaming Survey (Theme: retro, Visibility: public)
  // ==========================================
  console.log("Seeding Form 8: Gaming...");
  const [gamingForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "Next-Gen Gaming Hub",
      description: "Indulge in nostalgic platforms, RPG expectations, and your all-time favorite franchises.",
      slug: "gaming-survey",
      theme: "retro",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!gamingForm) throw new Error("Failed to create gamingForm");

  const gamingFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: gamingForm.id,
        type: "single_select",
        label: "What is your preferred gaming platform?",
        required: true,
        options: ["PC (Steam)", "PlayStation 5", "Nintendo Switch", "Xbox Series X", "Mobile"],
        order: 0,
      },
      {
        formId: gamingForm.id,
        type: "rating",
        label: "Rate your excitement for upcoming Open-World RPGs:",
        required: true,
        order: 1,
      },
      {
        formId: gamingForm.id,
        type: "short_text",
        label: "What is your all-time favorite game franchise?",
        required: false,
        placeholder: "e.g. Zelda, Witcher, Elden Ring...",
        order: 2,
      },
    ])
    .returning();

  const gamingOptions = [
    { platform: "PC (Steam)", rate: 5, game: "Elden Ring" },
    { platform: "PlayStation 5", rate: 5, game: "The Witcher" },
    { platform: "Nintendo Switch", rate: 4, game: "Zelda" },
    { platform: "Xbox Series X", rate: 3, game: "Halo" },
  ];

  for (let i = 0; i < 17; i++) {
    const template = gamingOptions[i % gamingOptions.length]!;
    const answers: Record<string, any> = {};
    answers[gamingFields[0]!.id] = template.platform;
    answers[gamingFields[1]!.id] = template.rate;
    answers[gamingFields[2]!.id] = template.game;

    await db.insert(responsesTable).values({
      formId: gamingForm.id,
      answers,
      ipAddress: `192.168.8.${80 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  // ==========================================
  // FORM 9: Wanderlust Travel Survey (Theme: fresh leaf, Visibility: public)
  // ==========================================
  console.log("Seeding Form 9: Travel...");
  const [travelForm] = await db
    .insert(formsTable)
    .values({
      userId: demoUser.id,
      title: "Dream Travel & Wanderlust",
      description: "Explore the ideal vacation type, Post-COVID travel convenience, and continent buckets.",
      slug: "travel-survey",
      theme: "fresh leaf",
      visibility: "public",
      status: "published",
    })
    .returning();

  if (!travelForm) throw new Error("Failed to create travelForm");

  const travelFields = await db
    .insert(fieldsTable)
    .values([
      {
        formId: travelForm.id,
        type: "single_select",
        label: "What kind of travel experience do you seek most?",
        required: true,
        options: ["Tropical Beaches", "Mountain Hiking & Nature", "Historical Cities & Museums", "Adrenaline & Adventure Sports"],
        order: 0,
      },
      {
        formId: travelForm.id,
        type: "rating",
        label: "How would you rate the general ease of international travel currently?",
        required: true,
        order: 1,
      },
      {
        formId: travelForm.id,
        type: "checkbox",
        label: "Which continents are on your bucket list for next year?",
        required: false,
        options: ["Europe", "Asia", "South America", "Africa", "Oceania"],
        order: 2,
      },
    ])
    .returning();

  const travelOptions = [
    { experience: "Mountain Hiking & Nature", rate: 4, continents: ["Europe", "Asia"] },
    { experience: "Tropical Beaches", rate: 5, continents: ["Asia", "Oceania"] },
    { experience: "Historical Cities & Museums", rate: 4, continents: ["Europe", "South America"] },
    { experience: "Adrenaline & Adventure Sports", rate: 3, continents: ["Africa", "South America"] },
  ];

  for (let i = 0; i < 13; i++) {
    const template = travelOptions[i % travelOptions.length]!;
    const answers: Record<string, any> = {};
    answers[travelFields[0]!.id] = template.experience;
    answers[travelFields[1]!.id] = template.rate;
    answers[travelFields[2]!.id] = template.continents;

    await db.insert(responsesTable).values({
      formId: travelForm.id,
      answers,
      ipAddress: `192.168.9.${90 + i}`,
      submittedAt: getRandomDateWithinWeek(i),
    });
  }

  console.log("Database seeded successfully with 'demo' user & 9 rich forms! ✅");
  await client.end();
}

main().catch((err) => {
  console.error("Seeding failed: ", err);
  client.end();
  process.exit(1);
});
