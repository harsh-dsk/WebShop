import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany();
  
  console.log(`CATEGORIES_COUNT=${categories.length}`);
  console.log(`PRODUCTS_COUNT=${products.length}`);

  let badImages = 0;
  for (const p of products) {
    const images = Array.isArray(p.images) ? p.images : JSON.parse(p.images as string || '[]');
    if (images.length === 0) {
      console.log(`Product ${p.slug} has no images`);
      badImages++;
    } else if (typeof images[0] === 'string') {
      console.log(`Product ${p.slug} has string image: ${images[0]}`);
      badImages++;
    } else if (!images[0].url) {
      console.log(`Product ${p.slug} has malformed image object`);
      badImages++;
    }
  }
  console.log(`BAD_IMAGES=${badImages}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
