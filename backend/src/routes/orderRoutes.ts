import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../middleware/error';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const router = Router();

const checkoutSchema = z.object({
  couponCode: z.string().optional().nullable(),
  paymentMethod: z.enum(['COD', 'STRIPE', 'BKASH', 'NAGAD']),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    streetAddress: z.string().min(5),
    apartment: z.string().optional().nullable(),
    city: z.string().min(2),
    district: z.string().min(2), // e.g. "Dhaka" or "Outside Dhaka"
    zipCode: z.string().optional().nullable(),
  }),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().optional().nullable(),
});

const couponCreateSchema = z.object({
  code: z.string().min(3),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BOGO']),
  value: z.number().positive(),
  minPurchase: z.number().nonnegative().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
});

// Helper: Calculate shipping fee based on district
const calculateShippingFee = (district: string, subtotal: number): number => {
  if (subtotal > 2500) return 0; // Free shipping over 2500 BDT
  return district.toLowerCase().includes('dhaka') && !district.toLowerCase().includes('outside') ? 80 : 150;
};

// ==========================================
// COUPON ROUTES
// ==========================================

// @route   GET /api/coupons/validate/:code
router.get('/coupons/validate/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { subtotal } = req.query;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new ApiError(404, 'Invalid coupon code');
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new ApiError(400, 'Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, 'Coupon usage limit reached');
    }

    if (subtotal && coupon.minPurchase && Number(subtotal) < Number(coupon.minPurchase)) {
      throw new ApiError(400, `Minimum purchase of BDT ${coupon.minPurchase} required`);
    }

    return res.json(coupon);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/coupons (Admin/Manager)
router.get('/coupons', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(coupons);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/coupons (Admin/Manager)
router.post('/coupons', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const data = couponCreateSchema.parse(req.body);
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase,
        usageLimit: data.usageLimit,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
    return res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ORDER CHECKOUT & RETRIEVAL
// ==========================================

// @route   POST /api/orders/checkout
router.post('/orders/checkout', async (req: AuthenticatedRequest, res, next) => {
  try {
    // Optional JWT Auth
    const authHeader = req.headers['authorization'];
    let userId: string | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'jaraviea_super_secret_key_123');
        userId = decoded.id;
      } catch (e) {
        // Fall back to guest checkout
      }
    }

    const data = checkoutSchema.parse(req.body);

    // 1. Validate variants and stock
    let subtotal = 0;
    const itemsToCreate: any[] = [];
    const variantsToUpdate: { id: string; newStock: number }[] = [];

    for (const item of data.items) {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new ApiError(404, `Variant ID ${item.variantId} not found`);
      }

      if (variant.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product ${variant.product.name} (Size: ${variant.size})`);
      }

      const price = variant.product.discountPrice 
        ? Number(variant.product.discountPrice) 
        : Number(variant.product.price);

      subtotal += price * item.quantity;
      itemsToCreate.push({
        variantId: variant.id,
        quantity: item.quantity,
        price,
      });

      variantsToUpdate.push({
        id: variant.id,
        newStock: variant.stock - item.quantity,
      });
    }

    // 2. Coupon Validation
    let discount = 0;
    let couponId: string | null = null;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) {
        if (!coupon.minPurchase || subtotal >= Number(coupon.minPurchase)) {
          couponId = coupon.id;
          if (coupon.type === 'PERCENTAGE') {
            discount = subtotal * (Number(coupon.value) / 100);
          } else if (coupon.type === 'FIXED') {
            discount = Number(coupon.value);
          }
        }
      }
    }

    // 3. Address setup
    let address;
    if (userId) {
      // Create user address and link
      address = await prisma.address.create({
        data: {
          userId,
          type: 'shipping',
          ...data.shippingAddress,
          isDefault: true,
        },
      });
    } else {
      // Create a guest address (unlinked to user)
      // Since Address model requires a userId in our Prisma schema, we will create a dummy user
      // or associate with a generic system user for guest addresses.
      // Let's modify: we will create a special guest user, or find/create a "GUEST" placeholder user.
      let guestUser = await prisma.user.findUnique({ where: { email: 'guest@jaraviea.com' } });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: 'guest@jaraviea.com',
            passwordHash: 'N/A',
            name: 'Guest Customer',
            role: 'CUSTOMER',
          },
        });
      }
      address = await prisma.address.create({
        data: {
          userId: guestUser.id,
          type: 'shipping',
          ...data.shippingAddress,
        },
      });
    }

    // 4. Totals computation
    const shippingFee = calculateShippingFee(data.shippingAddress.district, subtotal);
    const tax = subtotal * 0.05; // 5% tax
    const totalAmount = Math.max(0, subtotal - discount + tax + shippingFee);

    // 5. Deduct inventory and write records
    for (const v of variantsToUpdate) {
      await prisma.variant.update({
        where: { id: v.id },
        data: { stock: v.newStock },
      });

      const change = v.newStock - (v.newStock + itemsToCreate.find(i => i.variantId === v.id).quantity);
      await prisma.inventoryHistory.create({
        data: {
          variantId: v.id,
          changeQty: change,
          reason: 'PURCHASE',
        },
      });
    }

    // Increment coupon usage
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 6. Save order
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || data.shippingAddress.phone,
        shippingAddressId: address.id,
        status: 'PENDING',
        paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PAID', // mark as PAID if simulated online payment
        paymentMethod: data.paymentMethod,
        subtotal,
        tax,
        shippingFee,
        discount,
        totalAmount,
        couponId,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        shippingAddress: true,
      },
    });

    // If stripe/bKash is selected, simulate creating a transaction log
    if (data.paymentMethod !== 'COD') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          status: 'PAID',
          gateway: data.paymentMethod,
          transactionId: 'TXN-' + Date.now(),
          amount: totalAmount,
        },
      });
    }

    return res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/orders (Customer & Admin)
router.get('/orders', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    let orders;
    if (req.user.role === 'CUSTOMER') {
      // Return user's orders
      orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Admins/Managers see all orders
      orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
          shippingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return res.json(orders);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/orders/:id
router.get('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        shippingAddress: true,
        coupon: true,
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return res.json(order);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/orders/:id/status (Admin/Manager)
router.put('/orders/:id/status', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw new ApiError(400, 'Invalid order status');
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // If order was cancelled/returned/refunded, restore stock
    const isRestoring = ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(status) && 
                        !['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status);

    if (isRestoring) {
      for (const item of order.items) {
        await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });

        await prisma.inventoryHistory.create({
          data: {
            variantId: item.variantId,
            changeQty: item.quantity,
            reason: 'MANUAL_ADJUSTMENT', // Stock restored due to cancellation
          },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        paymentStatus: status === 'DELIVERED' ? 'PAID' : order.paymentStatus,
      },
    });

    return res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

export default router;
