import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Categories
  const categoriesData = [
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and electronics.', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800' },
    { name: 'Food & Grocery', slug: 'food-grocery', description: 'Fresh food, pantry staples, and groceries.', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing, apparel, and fashion accessories.', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800' },
    { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor, and home essentials.', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Accessories', slug: 'accessories', description: 'Bags, wallets, watches, and more.', imageUrl: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=800' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Skincare, haircare, and grooming.', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800' },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, imageUrl: c.imageUrl },
      create: { name: c.name, slug: c.slug, description: c.description, imageUrl: c.imageUrl },
    });
    categories[c.slug] = category.id;
  }
  console.log('Categories seeded.');

  // 2. Create Products
  const productsData = [
    // ELECTRONICS
    {
      name: 'iPhone 15 Pro', slug: 'iphone-15-pro',
      shortDescription: 'Titanium design with A17 Pro chip.',
      price: 134900, compareAtPrice: 144900, stock: 45, isFeatured: true, categoryId: categories['electronics'],
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5',
      shortDescription: 'Premium wireless noise-canceling headphones.',
      price: 29990, compareAtPrice: 34990, stock: 120, isFeatured: true, categoryId: categories['electronics'],
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Samsung Galaxy Buds 2', slug: 'samsung-galaxy-buds-2',
      shortDescription: 'True wireless earbuds with active noise cancellation.',
      price: 11999, compareAtPrice: 13999, stock: 80, isFeatured: false, categoryId: categories['electronics'],
      images: ['https://images.unsplash.com/photo-1606220588913-b3eea415a2ed?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Logitech MX Master 3S', slug: 'logitech-mx-master-3s',
      shortDescription: 'Advanced wireless mouse for precise control.',
      price: 8995, stock: 200, isFeatured: false, categoryId: categories['electronics'],
      images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c3f1f?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Apple Watch Series 9', slug: 'apple-watch-series-9',
      shortDescription: 'Smartwatch with advanced health sensors.',
      price: 41900, compareAtPrice: 44900, stock: 60, isFeatured: true, categoryId: categories['electronics'],
      images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=800'],
    },
    
    // FOOD & GROCERY
    {
      name: 'Premium Basmati Rice 5kg', slug: 'premium-basmati-rice',
      shortDescription: 'Extra long grain aged basmati rice.',
      price: 899, compareAtPrice: 1099, stock: 300, isFeatured: true, categoryId: categories['food-grocery'],
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Organic Green Tea 100g', slug: 'organic-green-tea',
      shortDescription: 'Refreshing organic green tea leaves.',
      price: 450, stock: 150, isFeatured: false, categoryId: categories['food-grocery'],
      images: ['https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Arabica Coffee Beans 250g', slug: 'arabica-coffee-beans',
      shortDescription: 'Freshly roasted 100% Arabica whole beans.',
      price: 650, compareAtPrice: 750, stock: 85, isFeatured: false, categoryId: categories['food-grocery'],
      images: ['https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Pure Organic Honey 500g', slug: 'organic-honey',
      shortDescription: 'Raw and unfiltered natural organic honey.',
      price: 599, stock: 120, isFeatured: false, categoryId: categories['food-grocery'],
      images: ['https://images.unsplash.com/photo-1587049352847-81a56d773c1c?auto=format&fit=crop&q=80&w=800'],
    },

    // FASHION
    {
      name: 'Classic Oversized T-Shirt', slug: 'classic-oversized-tshirt',
      shortDescription: '100% heavy cotton comfortable oversized tee.',
      price: 999, stock: 500, isFeatured: true, categoryId: categories['fashion'],
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Minimal Cotton Hoodie', slug: 'minimal-cotton-hoodie',
      shortDescription: 'Soft and warm fleece-lined hoodie.',
      price: 2499, compareAtPrice: 2999, stock: 150, isFeatured: false, categoryId: categories['fashion'],
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Slim Fit Denim Jeans', slug: 'slim-fit-denim',
      shortDescription: 'Premium stretch denim with a modern slim fit.',
      price: 1899, compareAtPrice: 2499, stock: 220, isFeatured: false, categoryId: categories['fashion'],
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Casual White Sneakers', slug: 'casual-sneakers',
      shortDescription: 'Everyday comfortable white leather sneakers.',
      price: 3499, stock: 90, isFeatured: true, categoryId: categories['fashion'],
      images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800'],
    },

    // HOME & LIVING
    {
      name: 'Minimal Desk Lamp', slug: 'minimal-desk-lamp',
      shortDescription: 'Adjustable LED desk lamp with dimming control.',
      price: 1499, stock: 75, isFeatured: false, categoryId: categories['home-living'],
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Ceramic Coffee Mug', slug: 'ceramic-coffee-mug',
      shortDescription: 'Handcrafted ceramic mug for your daily brew.',
      price: 499, stock: 300, isFeatured: false, categoryId: categories['home-living'],
      images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Premium Bedsheet Set', slug: 'premium-bedsheet-set',
      shortDescription: 'Ultra-soft 400 thread count cotton sheets.',
      price: 2999, compareAtPrice: 3999, stock: 60, isFeatured: true, categoryId: categories['home-living'],
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Wooden Desk Organizer', slug: 'wooden-desk-organizer',
      shortDescription: 'Keep your workspace tidy with this wooden organizer.',
      price: 899, stock: 110, isFeatured: false, categoryId: categories['home-living'],
      images: ['https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=800'],
    },

    // ACCESSORIES
    {
      name: 'Classic Leather Wallet', slug: 'leather-wallet',
      shortDescription: 'Genuine full-grain leather bifold wallet.',
      price: 1299, stock: 140, isFeatured: false, categoryId: categories['accessories'],
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Minimalist Travel Backpack', slug: 'minimal-backpack',
      shortDescription: 'Water-resistant daily carry backpack with laptop sleeve.',
      price: 3999, compareAtPrice: 4999, stock: 85, isFeatured: true, categoryId: categories['accessories'],
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Stainless Steel Water Bottle', slug: 'stainless-water-bottle',
      shortDescription: 'Insulated bottle keeps drinks cold for 24 hours.',
      price: 899, stock: 250, isFeatured: false, categoryId: categories['accessories'],
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Classic Analog Watch', slug: 'analog-watch',
      shortDescription: 'Minimalist quartz watch with leather strap.',
      price: 4599, compareAtPrice: 5999, stock: 45, isFeatured: true, categoryId: categories['accessories'],
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800'],
    },

    // BEAUTY & PERSONAL CARE
    {
      name: 'Gentle Face Cleanser', slug: 'face-cleanser',
      shortDescription: 'Hydrating facial cleanser for all skin types.',
      price: 699, stock: 180, isFeatured: false, categoryId: categories['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Daily Moisturizing Cream', slug: 'moisturizing-cream',
      shortDescription: 'Lightweight moisturizer with hyaluronic acid.',
      price: 899, stock: 210, isFeatured: true, categoryId: categories['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'],
    },
    {
      name: 'Premium Hair Care Set', slug: 'hair-care-set',
      shortDescription: 'Sulfate-free shampoo and conditioner duo.',
      price: 1499, compareAtPrice: 1899, stock: 95, isFeatured: false, categoryId: categories['beauty-personal-care'],
      images: ['https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800'],
    },
  ];

  for (const p of productsData) {
    const formattedImages = p.images.map(url => ({ url, alt: p.name }));
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice || null,
        stock: p.stock,
        isFeatured: p.isFeatured,
        images: formattedImages,
        categoryId: p.categoryId,
        isActive: true
      },
      create: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice || null,
        stock: p.stock,
        isFeatured: p.isFeatured,
        images: formattedImages,
        categoryId: p.categoryId,
        isActive: true
      }
    });
  }

  console.log('Products seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
