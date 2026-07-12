import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle2, Phone } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 text-center">
      
      {/* Thank you card */}
      <div className="space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-charcoal">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Thank you for shopping with JARAVIEA. Your order has been registered and is pending verification.
        </p>
      </div>

      {order && (
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 text-left max-w-xl mx-auto space-y-6">
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <div>
              <p className="text-xs text-neutral-400 uppercase font-semibold">Order Number</p>
              <p className="text-sm font-bold text-charcoal">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400 uppercase font-semibold">Order Date</p>
              <p className="text-sm font-semibold text-charcoal">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Items</h4>
            <div className="divide-y divide-neutral-50 max-h-48 overflow-y-auto">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between py-2 text-xs">
                  <span className="text-charcoal font-semibold">
                    {item.variant.product.name} (Size: {item.variant.size}) <span className="text-neutral-400">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-charcoal">BDT {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Pricing */}
          <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
            <div className="text-xs text-neutral-500 space-y-1">
              <p className="font-bold uppercase text-neutral-400 tracking-wider">Shipping Address</p>
              <p className="font-semibold text-charcoal">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.streetAddress}</p>
              <p>{order.shippingAddress.city}</p>
              <p className="flex items-center gap-1 mt-1 text-primary font-semibold">
                <Phone size={12} /> {order.shippingAddress.phone}
              </p>
            </div>

            <div className="text-xs text-neutral-500 space-y-1.5 text-right">
              <p className="font-bold uppercase text-neutral-400 tracking-wider text-right">Payment Info</p>
              <p>Method: <span className="font-semibold text-charcoal">{order.paymentMethod}</span></p>
              <p>Delivery: <span className="font-semibold text-charcoal">BDT {order.shippingFee}</span></p>
              <p>VAT (5%): <span className="font-semibold text-charcoal">BDT {Number(order.tax).toFixed(1)}</span></p>
              <p className="text-sm font-bold text-primary pt-1.5 border-t border-neutral-200">
                Total Paid: BDT {Number(order.totalAmount).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation options */}
      <div className="flex gap-4 justify-center max-w-sm mx-auto">
        <Link
          to="/collections/all-shoes"
          className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
        >
          Continue Shopping
        </Link>
        <Link
          to="/dashboard"
          className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-charcoal text-sm font-semibold rounded-lg transition-all"
        >
          Track My Order
        </Link>
      </div>

    </div>
  );
};
export default OrderSuccess;
