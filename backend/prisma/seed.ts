import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventoryHistory.deleteMany({});
  await prisma.variant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.heroBanner.deleteMany({});
  await prisma.promoCard.deleteMany({});

  console.log('Seeding roles & users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('rifat991', salt);
  const customerPasswordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@jaraviea.com',
      passwordHash: adminPasswordHash,
      name: 'Rifat Administrator',
      phone: '01700000000',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@jaraviea.com',
      passwordHash: customerPasswordHash,
      name: 'Sarah Shopper',
      phone: '01900000000',
      role: 'CUSTOMER',
    },
  });

  console.log('Seeding categories...');
  const heelCat = await prisma.category.create({
    data: { name: 'Heel', slug: 'heel', sortOrder: 1, isFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200&auto=format&fit=crop' },
  });
  const flatCat = await prisma.category.create({
    data: { name: 'Flat', slug: 'flat', sortOrder: 2, isFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=200&auto=format&fit=crop' },
  });
  const mulesCat = await prisma.category.create({
    data: { name: 'Mules', slug: 'mules', sortOrder: 3, isFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=200&auto=format&fit=crop' },
  });
  const bostonCat = await prisma.category.create({
    data: { name: 'Boston Clog', slug: 'boston', sortOrder: 4, isFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=200&auto=format&fit=crop' },
  });
  const slideCat = await prisma.category.create({
    data: { name: 'Slide', slug: 'slide', sortOrder: 5, isFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=200&auto=format&fit=crop' },
  });
  const comfortCat = await prisma.category.create({
    data: { name: 'Dr Shoe Comfort', slug: 'drshoe', sortOrder: 6, isFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200&auto=format&fit=crop' },
  });

  console.log('Seeding products & variants...');
  
  // Product 1: Zeen Low Heel
  const zeen = await prisma.product.create({
    data: {
      name: 'Zeen Low Block Heel',
      slug: 'zeen-low-heel',
      price: 1980.00,
      discountPrice: 1580.00,
      sku: 'SHOE-ZEEN-01',
      description: 'An elegant low heel designed for everyday comfort and modern style. Handcrafted with premium vegan leather, features a padded insole and a sturdy 1.5-inch block heel. Ideal for corporate wear, casual outings, or semi-formal occasions.',
      material: 'Vegan Leather',
      status: 'PUBLISHED',
      isFeatured: true,
      isBestSeller: true,
      categoryId: heelCat.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop', order: 0 },
          { url: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=600&auto=format&fit=crop', order: 1 }
        ]
      },
      variants: {
        create: [
          { size: '36', color: 'Beige', stock: 12, sku: 'SHOE-ZEEN-01-36-BEI' },
          { size: '37', color: 'Beige', stock: 15, sku: 'SHOE-ZEEN-01-37-BEI' },
          { size: '38', color: 'Beige', stock: 20, sku: 'SHOE-ZEEN-01-38-BEI' },
          { size: '39', color: 'Beige', stock: 10, sku: 'SHOE-ZEEN-01-39-BEI' },
          { size: '40', color: 'Beige', stock: 8, sku: 'SHOE-ZEEN-01-40-BEI' },
          { size: '37', color: 'Black', stock: 10, sku: 'SHOE-ZEEN-01-37-BLK' },
          { size: '38', color: 'Black', stock: 14, sku: 'SHOE-ZEEN-01-38-BLK' }
        ]
      }
    }
  });

  // Product 2: Isha Flat
  const isha = await prisma.product.create({
    data: {
      name: 'Isha Pointed Flat',
      slug: 'isha-flat',
      price: 1750.00,
      discountPrice: 1480.00,
      sku: 'SHOE-ISHA-02',
      description: 'Ultra-cushioned pointing flats adorned with a minimal criss-cross design. Lightweight, durable, and highly breathable, perfect for running errands or styling with casual office wear.',
      material: 'Brushed Suede',
      status: 'PUBLISHED',
      isFeatured: true,
      categoryId: flatCat.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', order: 0 }
        ]
      },
      variants: {
        create: [
          { size: '37', color: 'Tan', stock: 15, sku: 'SHOE-ISHA-02-37-TAN' },
          { size: '38', color: 'Tan', stock: 25, sku: 'SHOE-ISHA-02-38-TAN' },
          { size: '39', color: 'Tan', stock: 18, sku: 'SHOE-ISHA-02-39-TAN' }
        ]
      }
    }
  });

  // Product 3: Ayzel Mules
  const ayzel = await prisma.product.create({
    data: {
      name: 'Ayzel Braided Mules',
      slug: 'ayzel-mules',
      price: 1690.00,
      sku: 'SHOE-AYZEL-03',
      description: 'Sophisticated backless slip-on mules featuring an eye-catching braided strap. Combines the easy convenience of slides with the upscale look of closed-toe shoes. Crafted for active lifestyles.',
      material: 'Vegan Matte Leather',
      status: 'PUBLISHED',
      isFeatured: true,
      categoryId: mulesCat.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=600&auto=format&fit=crop', order: 0 }
        ]
      },
      variants: {
        create: [
          { size: '36', color: 'Off-White', stock: 10, sku: 'SHOE-AYZEL-03-36-OWH' },
          { size: '38', color: 'Off-White', stock: 12, sku: 'SHOE-AYZEL-03-38-OWH' }
        ]
      }
    }
  });

  // Product 4: Luma Boston Clog
  const luma = await prisma.product.create({
    data: {
      name: 'Luma Boston Suede Clog',
      slug: 'luma-boston',
      price: 1890.00,
      sku: 'SHOE-LUMA-04',
      description: 'Classic closed-toe Boston clog sandals. Features an adjustable side strap with metal buckle, premium brushed-suede-texture finish, and an anatomical contoured footbed that molds to your feet over time.',
      material: 'Suede Finish',
      status: 'PUBLISHED',
      isFeatured: true,
      isBestSeller: true,
      categoryId: bostonCat.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', order: 0 }
        ]
      },
      variants: {
        create: [
          { size: '38', color: 'Taupe', stock: 8, sku: 'SHOE-LUMA-04-38-TAU' },
          { size: '39', color: 'Taupe', stock: 6, sku: 'SHOE-LUMA-04-39-TAU' }
        ]
      }
    }
  });

  console.log('Setting self-relations for products...');
  // Connect Zeen with Isha and Ayzel
  await prisma.product.update({
    where: { id: zeen.id },
    data: {
      relatedTo: {
        connect: [{ id: isha.id }, { id: ayzel.id }]
      }
    }
  });

  console.log('Seeding site settings...');
  await prisma.siteSetting.createMany({
    data: [
      { key: 'shopName', value: 'JARAVIEA' },
      { key: 'announcement', value: 'CASH ON DELIVERY AVAILABLE | 3-DAY EXCHANGE GUARANTEE | FREE SHIPPING OVER 2500 BDT' },
      { key: 'shippingDhaka', value: '80' },
      { key: 'shippingOutside', value: '150' },
      { key: 'sliderAutoplay', value: 'true' },
      { key: 'sliderAutoplayDelay', value: '5000' },
      { key: 'sliderTransitionSpeed', value: '700' },
      { key: 'sliderInfiniteLoop', value: 'true' },
      { key: 'sliderPauseOnHover', value: 'true' },
      { key: 'sliderShowArrows', value: 'true' },
      { key: 'sliderShowDots', value: 'true' },
      { key: 'sliderEnableSwipe', value: 'true' }
    ]
  });

  console.log('Seeding sample coupons...');
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10.00,
      minPurchase: 1000.00,
      expiryDate: new Date('2027-12-31'),
    }
  });

  console.log('Seeding hero banners...');
  await prisma.heroBanner.createMany({
    data: [
      {
        heading: 'Up to 40% OFF',
        subtitle: 'Summer Collection',
        description: 'Step into comfort with our original summer designs and premium slides.',
        buttonText: 'Shop Now',
        buttonUrl: '/collections/slide',
        desktopImageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=1200&auto=format&fit=crop',
        tabletImageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=800&auto=format&fit=crop',
        mobileImageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=600&auto=format&fit=crop',
        discountBadge: '40% OFF',
        duration: 5,
        sortOrder: 0,
        isActive: true,
      },
      {
        heading: "Premium Women's Footwear",
        subtitle: 'New Arrivals',
        description: 'Discover handcrafted block heels and flats designed for the modern woman.',
        buttonText: 'Explore Collection',
        buttonUrl: '/collections/heel',
        desktopImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop',
        tabletImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
        mobileImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop',
        discountBadge: 'NEW',
        duration: 5,
        sortOrder: 1,
        isActive: true,
      },
      {
        heading: 'Exclusive Designs',
        subtitle: 'Limited Offer',
        description: 'Shop our luxury Boston clogs and mules before stocks run out.',
        buttonText: 'Buy Now',
        buttonUrl: '/collections/boston',
        desktopImageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop',
        tabletImageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',
        mobileImageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop',
        discountBadge: 'LIMITED',
        duration: 5,
        sortOrder: 2,
        isActive: true,
      }
    ]
  });

  console.log('Seeding promo cards...');
  await prisma.promoCard.createMany({
    data: [
      {
        title: 'Up to 50% OFF',
        description: 'Deals on summer flats.',
        discountText: 'Save Big',
        badgeText: '🔥 Flash Sale',
        buttonText: 'Shop Now',
        buttonUrl: '/collections/flat',
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop',
        isActive: true,
        showOnDesktop: true,
        showOnLaptop: true,
        showOnTablet: true,
        showOnMobile: false,
        sortOrder: 0,
      },
      {
        title: 'Premium Collection',
        description: 'Handcrafted mules & heels.',
        discountText: 'New Arrivals',
        badgeText: '✨ New Arrival',
        buttonText: 'Explore',
        buttonUrl: '/collections/mules',
        imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6f74b30d?q=80&w=600&auto=format&fit=crop',
        isActive: true,
        showOnDesktop: true,
        showOnLaptop: true,
        showOnTablet: true,
        showOnMobile: false,
        sortOrder: 1,
      }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
