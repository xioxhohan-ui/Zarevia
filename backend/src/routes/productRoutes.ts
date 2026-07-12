import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../middleware/error';

const router = Router();

// Zod validation schemas
const productCreateSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  discountPrice: z.number().nonnegative().optional().nullable(),
  sku: z.string(),
  barcode: z.string().optional().nullable(),
  weight: z.number().optional().nullable(),
  description: z.string(),
  shortDesc: z.string().optional().nullable(),
  specifications: z.any().optional(),
  material: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  categoryId: z.string(),
  images: z.array(z.string()).default([]), // image URLs
  variants: z.array(z.object({
    size: z.string(),
    color: z.string(),
    stock: z.number().int().nonnegative(),
    sku: z.string(),
  })).default([]),
  relatedProductIds: z.array(z.string()).default([]),
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  bannerUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// Helper to generate a slug
const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// ==========================================
// CATEGORY ROUTES
// ==========================================

// @route   GET /api/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return res.json(categories);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/categories (Admin/Manager)
router.post('/categories', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const slug = data.slug || generateSlug(data.name);

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });
    return res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/categories/:id (Admin/Manager)
router.put('/categories/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = categorySchema.parse(req.body);
    const slug = data.slug || generateSlug(data.name);

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });
    return res.json(category);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/categories/:id (Admin only)
router.delete('/categories/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// PRODUCT ROUTES
// ==========================================

// @route   GET /api/products
router.get('/products', async (req, res, next) => {
  try {
    const { category, size, color, search, minPrice, maxPrice, sort, status, featured } = req.query;

    const where: any = {};

    // Filter by status (public view only sees PUBLISHED by default)
    if (status) {
      where.status = status as string;
    } else {
      where.status = 'PUBLISHED';
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (category) {
      where.category = { slug: category as string };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size: size as string } : {}),
          ...(color ? { color: color as string } : {}),
        },
      };
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-high') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popularity') {
      orderBy = { isBestSeller: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
      orderBy,
    });

    return res.json(products);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/:slug
router.get('/products/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        relatedTo: {
          include: {
            images: { take: 1, orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return res.json(product);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/products (Admin/Manager)
router.post('/products', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const data = productCreateSchema.parse(req.body);
    const slug = generateSlug(data.name);

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!categoryExists) {
      throw new ApiError(404, 'Category not found');
    }

    // Check slug collision
    const slugCollision = await prisma.product.findUnique({ where: { slug } });
    if (slugCollision) {
      throw new ApiError(400, 'Product name generates a duplicate slug');
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        price: data.price,
        discountPrice: data.discountPrice,
        sku: data.sku,
        barcode: data.barcode,
        weight: data.weight,
        description: data.description,
        shortDesc: data.shortDesc,
        specifications: data.specifications,
        material: data.material,
        status: data.status,
        isFeatured: data.isFeatured,
        isTrending: data.isTrending,
        isBestSeller: data.isBestSeller,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        ogImage: data.ogImage,
        categoryId: data.categoryId,
        images: {
          create: data.images.map((url, idx) => ({ url, order: idx })),
        },
        variants: {
          create: data.variants,
        },
        relatedTo: {
          connect: data.relatedProductIds.map((id) => ({ id })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    // Record initial inventory history
    for (const variant of product.variants) {
      await prisma.inventoryHistory.create({
        data: {
          variantId: variant.id,
          changeQty: variant.stock,
          reason: 'RESTOCK',
        },
      });
    }

    return res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/products/:id (Admin/Manager)
router.put('/products/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = productCreateSchema.parse(req.body);
    const slug = generateSlug(data.name);

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!existingProduct) {
      throw new ApiError(404, 'Product not found');
    }

    // Delete old images & variants to replace
    await prisma.productImage.deleteMany({ where: { productId: id } });
    
    // For variants, we update existing ones or delete and recreate
    await prisma.variant.deleteMany({ where: { productId: id } });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        price: data.price,
        discountPrice: data.discountPrice,
        sku: data.sku,
        barcode: data.barcode,
        weight: data.weight,
        description: data.description,
        shortDesc: data.shortDesc,
        specifications: data.specifications,
        material: data.material,
        status: data.status,
        isFeatured: data.isFeatured,
        isTrending: data.isTrending,
        isBestSeller: data.isBestSeller,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        ogImage: data.ogImage,
        categoryId: data.categoryId,
        images: {
          create: data.images.map((url, idx) => ({ url, order: idx })),
        },
        variants: {
          create: data.variants,
        },
        relatedTo: {
          set: data.relatedProductIds.map((rid) => ({ id: rid })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    // Record inventory changes if stock is different
    for (const newVar of updated.variants) {
      const oldVar = existingProduct.variants.find((v) => v.size === newVar.size && v.color === newVar.color);
      const diff = newVar.stock - (oldVar ? oldVar.stock : 0);
      if (diff !== 0) {
        await prisma.inventoryHistory.create({
          data: {
            variantId: newVar.id,
            changeQty: diff,
            reason: 'MANUAL_ADJUSTMENT',
          },
        });
      }
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/products/:id (Admin only)
router.delete('/products/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// REVIEW ROUTES
// ==========================================

// @route   POST /api/products/:id/reviews (Customer only)
router.post('/products/:id/reviews', authenticateToken, requireRole(['CUSTOMER']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const data = reviewSchema.parse(req.body);

    if (!req.user) throw new ApiError(401, 'Unauthorized');

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: req.user.id,
        rating: data.rating,
        comment: data.comment,
        // Auto-approve reviews for customer convenience, or require admin approval:
        isApproved: true, 
      },
    });

    return res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

export default router;
