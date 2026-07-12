import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Ensure all subroutes here require ADMIN or SUPERADMIN role
router.use(authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']));

// @route   GET /api/admin/reports/sales
// Returns summarized revenue statistics
router.get('/reports/sales', async (req: AuthenticatedRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ['CANCELLED', 'RETURNED', 'REFUNDED'] },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group sales by month (last 6 months)
    const monthlySales: { [month: string]: number } = {};
    orders.forEach((o) => {
      const month = new Date(o.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlySales[month] = (monthlySales[month] || 0) + Number(o.totalAmount);
    });

    const monthlySalesArray = Object.keys(monthlySales).map((month) => ({
      name: month,
      revenue: monthlySales[month],
    })).slice(-6);

    return res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      monthlySales: monthlySalesArray,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/reports/top-products
// Returns top selling items
router.get('/reports/top-products', async (req: AuthenticatedRequest, res, next) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { status: { notIn: ['CANCELLED', 'RETURNED', 'REFUNDED'] } },
      },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    const productSales: { [id: string]: { name: string; quantity: number; revenue: number } } = {};

    orderItems.forEach((item) => {
      const prod = item.variant.product;
      if (!productSales[prod.id]) {
        productSales[prod.id] = { name: prod.name, quantity: 0, revenue: 0 };
      }
      productSales[prod.id].quantity += item.quantity;
      productSales[prod.id].revenue += Number(item.price) * item.quantity;
    });

    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return res.json(sortedProducts);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/reports/categories
// Returns sales distribution by category
router.get('/reports/categories', async (req: AuthenticatedRequest, res, next) => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { status: { notIn: ['CANCELLED', 'RETURNED', 'REFUNDED'] } },
      },
      include: {
        variant: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    const categorySales: { [name: string]: number } = {};

    orderItems.forEach((item) => {
      const catName = item.variant.product.category.name;
      categorySales[catName] = (categorySales[catName] || 0) + Number(item.price) * item.quantity;
    });

    const formatted = Object.keys(categorySales).map((name) => ({
      name,
      value: categorySales[name],
    }));

    return res.json(formatted);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/inventory/low-stock
// Lists variants that are low in stock (less than 5 units)
router.get('/inventory/low-stock', async (req: AuthenticatedRequest, res, next) => {
  try {
    const lowStock = await prisma.variant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: true },
      orderBy: { stock: 'asc' },
    });
    return res.json(lowStock);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/logs
// Lists audit log events
router.get('/logs', async (req: AuthenticatedRequest, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json(logs);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/settings
// Fetches website configuration settings
router.get('/settings', async (req: AuthenticatedRequest, res, next) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const formatted: { [key: string]: string } = {};
    settings.forEach((s) => {
      formatted[s.key] = s.value;
    });
    return res.json(formatted);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/admin/settings
// Updates global website configurations
router.put('/settings', async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = req.body; // key-value map

    for (const key of Object.keys(body)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(body[key]) },
        create: { key, value: String(body[key]) },
      });
    }

    return res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/admin/media
// Fetch all Media Library entries
router.get('/media', async (req: AuthenticatedRequest, res, next) => {
  try {
    const media = await prisma.mediaLibrary.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploadedBy: {
          select: { name: true, email: true }
        }
      }
    });
    return res.json(media);
  } catch (err) {
    next(err);
  }
});

export default router;
