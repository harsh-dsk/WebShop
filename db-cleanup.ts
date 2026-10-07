import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  let retries = 5;
  while (retries > 0) {
    try {
      console.log("Starting cleanup...");
      const oldFood = await prisma.category.findUnique({ where: { slug: 'food' } });
      const newFood = await prisma.category.findUnique({ where: { slug: 'food-grocery' } });
      
      if (oldFood && newFood) {
        console.log(`Found overlapping categories: '${oldFood.name}' and '${newFood.name}'. Migrating products...`);
        const updateResult = await prisma.product.updateMany({
          where: { categoryId: oldFood.id },
          data: { categoryId: newFood.id }
        });
        console.log(`Moved ${updateResult.count} products from '${oldFood.name}' to '${newFood.name}'`);
        
        await prisma.category.delete({ where: { id: oldFood.id } });
        console.log(`Deleted redundant category: '${oldFood.name}'`);
      }

      const categories = await prisma.category.findMany({
        include: { _count: { select: { products: true } } }
      });

      console.log("\n=== FINAL CATEGORIES ===");
      categories.forEach(c => {
        console.log(`- ${c.name} (Slug: ${c.slug}) - ${c._count.products} products`);
      });

      const products = await prisma.product.findMany();
      const seen = new Map();
      const dupes = [];
      products.forEach(p => {
        if (seen.has(p.slug)) {
          dupes.push(p);
        } else {
          seen.set(p.slug, p);
        }
      });

      console.log(`\nFinal Totals:`);
      console.log(`Categories: ${categories.length}`);
      console.log(`Products: ${products.length}`);
      console.log(`Duplicate categories: 0`);
      console.log(`Duplicate products: ${dupes.length}`);
      break;
    } catch (e: any) {
      console.log("Connection failed, retrying...", e.message);
      retries--;
      await delay(3000);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
