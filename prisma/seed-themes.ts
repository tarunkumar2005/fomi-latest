import { prisma } from "../src/lib/db";
import { DEFAULT_THEMES } from "../src/data/default-themes";

async function seedThemes() {
  console.log("🎨 Starting theme seed...");

  try {
    // Seed all default themes
    for (const theme of DEFAULT_THEMES) {
      console.log(`  → Seeding theme: ${theme.name}`);

      await prisma.formTheme.upsert({
        where: { id: theme.id },
        update: {
          name: theme.name,
          description: theme.description,
          category: "professional",
          isBuiltIn: true,
          colors: theme.colors as any,
          typography: theme.typography as any,
          layout: theme.layout as any,
          buttons: theme.buttons as any,
          inputFields: theme.inputFields as any,
        },
        create: {
          id: theme.id,
          name: theme.name,
          description: theme.description || "",
          category: "professional",
          isBuiltIn: true,
          colors: theme.colors as any,
          typography: theme.typography as any,
          layout: theme.layout as any,
          buttons: theme.buttons as any,
          inputFields: theme.inputFields as any,
        },
      });
    }

    console.log("✅ Successfully seeded 7 built-in themes");
  } catch (error) {
    console.error("❌ Error seeding themes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedThemes().catch((error) => {
  console.error(error);
  process.exit(1);
});
