import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  collections: string[]; // collections handles tags/categories, e.g., ['heel', 'all-shoes']
  sizes: string[]; // e.g. ['36', '37', '38', '39', '40', '41']
  colors: string[]; // e.g. ['Beige', 'Black', 'Nude']
  images: string[]; // paths, e.g., ['/images/zeen-low-heel.jpg']
  inStock: boolean;
  isBestSelling?: boolean;
  createdAt: string;
}

export interface NavbarItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: 'Dhaka' | 'Outside Dhaka';
  shippingFee: number;
  totalAmount: number;
  items: OrderItem[];
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface SiteSettings {
  shopName: string;
  announcement: string;
  shippingFeeDhaka: number;
  shippingFeeOutside: number;
}

export interface DatabaseSchema {
  products: Product[];
  navbar: NavbarItem[];
  orders: Order[];
  settings: SiteSettings;
}

const DB_FILE_PATH = path.join(process.cwd(), 'db.json');

const INITIAL_NAVBAR: NavbarItem[] = [
  { id: '1', label: 'All Shoes', url: '/collections/all-shoes', order: 1 },
  { id: '2', label: 'SALE', url: '/collections/sale', order: 2 },
  { id: '3', label: 'Best Selling', url: '/collections/best-selling', order: 3 },
  { id: '4', label: 'Chappal', url: '/collections/chappal', order: 4 },
  { id: '5', label: 'Slide', url: '/collections/slide', order: 5 },
  { id: '6', label: 'Mules', url: '/collections/mules', order: 6 },
  { id: '7', label: 'Boston', url: '/collections/boston', order: 7 },
  { id: '8', label: 'Karchupi(Zardosi)', url: '/collections/karchupizardosi', order: 8 },
  { id: '9', label: 'Heel', url: '/collections/heel', order: 9 },
  { id: '10', label: 'Thongs', url: '/collections/thongs', order: 10 },
  { id: '11', label: 'Strappy', url: '/collections/strappy', order: 11 },
  { id: '12', label: 'Flat', url: '/collections/flat', order: 12 },
  { id: '13', label: 'Dr Shoe', url: '/collections/drshoe', order: 13 },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Zeen Low Heel',
    slug: 'zeen-low-heel',
    price: 1580,
    originalPrice: 1980,
    description: 'An elegant low heel designed for everyday comfort and modern style. Handcrafted with premium vegan leather, features a padded insole and a sturdy 1.5-inch block heel. Ideal for corporate wear, casual outings, or semi-formal occasions.',
    collections: ['heel', 'all-shoes', 'best-selling'],
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Beige', 'Black', 'Nude'],
    images: ['/images/zeen-low-heel.jpg'],
    inStock: true,
    isBestSelling: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Waza Heel',
    slug: 'waza-heel',
    price: 1520,
    description: 'Stylish pointed-toe slingback heels featuring a comfortable 2-inch kitten heel. Designed with a contemporary metallic buckle detail, Waza Heel adds a refined elegance to both formal trousers and festive dresses.',
    collections: ['heel', 'all-shoes'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Black', 'Off-White'],
    images: ['/images/waza-heel.jpg'],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Isha Flat',
    slug: 'isha-flat',
    price: 1480,
    originalPrice: 1750,
    description: 'Ultra-cushioned pointing flats adorned with a minimal criss-cross design. Lightweight, durable, and highly breathable, perfect for running errands or styling with casual office wear.',
    collections: ['flat', 'all-shoes', 'best-selling'],
    sizes: ['37', '38', '39', '40', '41'],
    colors: ['Tan', 'Black', 'Olive'],
    images: ['/images/isha-flat.jpg'],
    inStock: true,
    isBestSelling: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'Ayzel Mules',
    slug: 'ayzel-mules',
    price: 1690,
    description: 'Sophisticated backless slip-on mules featuring an eye-catching braided strap. Combines the easy convenience of slides with the upscale look of closed-toe shoes. Crafted for active lifestyles.',
    collections: ['mules', 'all-shoes', 'best-selling'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Taupe', 'Cream'],
    images: ['/images/ayzel-mules.jpg'],
    inStock: true,
    isBestSelling: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    name: 'Luma Boston',
    slug: 'luma-boston',
    price: 1890,
    description: 'Classic closed-toe Boston clog sandals. Features an adjustable side strap with metal buckle, premium brushed-suede-texture finish, and an anatomical contoured footbed that molds to your feet over time.',
    collections: ['boston', 'all-shoes'],
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Khaki', 'Dark Brown'],
    images: ['/images/luma-boston.jpg'],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p6',
    name: 'Haya Flat Slipper',
    slug: 'haya-flat-slipper',
    price: 1180,
    originalPrice: 1480,
    description: 'Minimalist slip-on flat slippers with a clean dual-band strap. Soft underfoot cushioning ensures all-day relief, while the textured rubber outsole offers excellent grip.',
    collections: ['flat', 'all-shoes', 'sale'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Tan', 'Nude'],
    images: ['/images/haya-flat-slipper.jpg'],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p7',
    name: 'Suna Flat',
    slug: 'suna-flat',
    price: 995,
    originalPrice: 1250,
    description: 'Simple everyday home-and-outdoor comfort flats. Adorned with a small elegant bow detail, these shoes are incredibly lightweight and flexible, catering to casual comfort.',
    collections: ['flat', 'all-shoes', 'sale'],
    sizes: ['37', '38', '39', '40'],
    colors: ['Dusty Pink', 'Black'],
    images: ['/images/suna-flat.jpg'],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p8',
    name: 'Dr Shoe Comfort',
    slug: 'dr-shoe-comfort',
    price: 1990,
    description: 'Orthopedic-grade doctor shoes featuring an extra-padded acupressure sole. Scientifically engineered for maximum foot-pain relief, suitable for long standing hours, elderly wear, or therapeutic purposes.',
    collections: ['drshoe', 'all-shoes', 'best-selling'],
    sizes: ['37', '38', '39', '40', '41'],
    colors: ['Black', 'Navy Blue'],
    images: ['/images/dr-shoe-comfort.jpg'],
    inStock: true,
    isBestSelling: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p9',
    name: 'Zardosi Karchupi Slipper',
    slug: 'zardosi-karchupi-slipper',
    price: 2200,
    description: 'Exquisite handcrafted slippers detailed with traditional Karchupi (Zardosi) gold wire and bead embroidery. Perfect for wedding celebrations, festive gatherings, or matching with traditional ethnic wear.',
    collections: ['karchupizardosi', 'all-shoes'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Golden', 'Maroon'],
    images: ['/images/zardosi-karchupi-slipper.jpg'],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p10',
    name: 'Casual Thongs',
    slug: 'casual-thongs',
    price: 850,
    originalPrice: 1100,
    description: 'Beach-and-breeze inspired casual thong sandals. Simple T-strap layout made of skin-friendly flexible polymer with a highly elastic sole for outdoor ease.',
    collections: ['thongs', 'all-shoes', 'sale'],
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Cherry Red', 'Aqua Blue'],
    images: ['/images/casual-thongs.jpg'],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p11',
    name: 'Classic Slide',
    slug: 'classic-slide',
    price: 1290,
    description: 'Unisex comfort slides with an ergonomic curved footbed. The wide single strap offers a snug grip, matching the casual laid-back style of loungewear or outdoor relaxation.',
    collections: ['slide', 'all-shoes'],
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Grey', 'Black', 'White'],
    images: ['/images/classic-slide.jpg'],
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p12',
    name: 'Strappy Glint Sandal',
    slug: 'strappy-glint-sandal',
    price: 1650,
    description: 'Ankle-wrapping strappy sandals embellished with delicate shimmery straps. Enhances any casual outfit with a touch of elegance, featuring a flat slip-resistant sole.',
    collections: ['strappy', 'all-shoes', 'best-selling'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Silver', 'Gold'],
    images: ['/images/strappy-glint-sandal.jpg'],
    inStock: true,
    isBestSelling: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p13',
    name: 'Chappal Classic',
    slug: 'chappal-classic',
    price: 1150,
    originalPrice: 1350,
    description: 'Classic-style ethnic chappal sandals with a toe-ring and broad cross-over strap. Richly crafted from soft tan leatherette, combining simplicity and comfort.',
    collections: ['chappal', 'all-shoes', 'sale'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Tan', 'Dark Brown'],
    images: ['/images/chappal-classic.jpg'],
    inStock: true,
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_SETTINGS: SiteSettings = {
  shopName: 'MYRO',
  announcement: 'Cash on Delivery Available | Exchange within 3 Days | Free delivery for orders above 2,500 BDT',
  shippingFeeDhaka: 80,
  shippingFeeOutside: 150,
};

const INITIAL_DB_DATA: DatabaseSchema = {
  products: INITIAL_PRODUCTS,
  navbar: INITIAL_NAVBAR,
  orders: [],
  settings: INITIAL_SETTINGS,
};

// In-memory cache fallback for serverless/read-only environments (e.g. Vercel)
let _memoryDB: DatabaseSchema | null = null;

export function readDB(): DatabaseSchema {
  // 1. Try reading from disk
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      if (data.trim()) {
        const parsed = JSON.parse(data) as DatabaseSchema;
        _memoryDB = parsed; // keep memory cache in sync
        return parsed;
      }
    }
  } catch (error) {
    console.warn('[DB] Filesystem read failed, falling back to memory/initial data:', error);
  }

  // 2. Fall back to in-memory cache (survives within the same serverless invocation)
  if (_memoryDB) return _memoryDB;

  // 3. Fall back to initial hardcoded data — try to persist to disk but don't crash
  _memoryDB = INITIAL_DB_DATA;
  writeDB(INITIAL_DB_DATA); // safe: won't throw even if disk is read-only
  return INITIAL_DB_DATA;
}

export function writeDB(data: DatabaseSchema): void {
  // Always update the in-memory cache so reads are consistent within the process
  _memoryDB = data;

  // Attempt to persist to disk — silently swallow errors on read-only filesystems
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    // On Vercel (and other serverless platforms) the filesystem is read-only.
    // Data is kept in _memoryDB for the lifetime of this function invocation.
    console.warn('[DB] Filesystem write skipped (read-only environment):', (error as Error).message);
  }
}

