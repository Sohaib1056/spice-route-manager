import { Request, Response } from "express";
import Product from "../models/Product";
import Sale from "../models/Sale";
import Purchase from "../models/Purchase";
import FinanceTransaction from "../models/FinanceTransaction";
import Return from "../models/Return";
import WebsiteOrder from "../models/WebsiteOrder";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const last7DaysDate = new Date();
    last7DaysDate.setDate(last7DaysDate.getDate() - 7);
    last7DaysDate.setHours(0, 0, 0, 0);

    const [products, sales, purchases, transactions, returns, websiteOrders, todaySalesData, todayWebsiteOrders, todayReturns] = await Promise.all([
      Product.find().select("name stock category sku buyPrice sellPrice active minStock").lean(),
      Sale.find().select("total date items invoice customer customerPhone").lean(),
      Purchase.find().select("total status date").lean(),
      FinanceTransaction.find().select("amount type category date").lean(),
      Return.find({ status: { $in: ["Approved", "Refunded"] } }).select("refundAmount items status refundedAt processedAt createdAt").lean(),
      WebsiteOrder.find({ paymentStatus: "Paid" }).select("total orderDate items customer shippingCharges").lean(),
      Sale.find({ 
        $or: [
          { date: { $gte: today, $lt: tomorrow } },
          { createdAt: { $gte: today, $lt: tomorrow } }
        ]
      }).select("total date items invoice").lean(),
      WebsiteOrder.find({ 
        paymentStatus: "Paid", 
        $or: [
          { orderDate: { $gte: today, $lt: tomorrow } },
          { createdAt: { $gte: today, $lt: tomorrow } }
        ]
      }).select("total orderDate items shippingCharges").lean(),
      Return.find({ 
        status: { $in: ["Approved", "Refunded"] },
        $or: [
          { refundedAt: { $gte: today, $lt: tomorrow } },
          { processedAt: { $gte: today, $lt: tomorrow } },
          { createdAt: { $gte: today, $lt: tomorrow } }
        ]
      }).select("refundAmount items status").lean()
    ]);

    const refundedAmount = returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const todayRefundedAmount = todayReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const posRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const websiteRevenue = websiteOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    const totalRevenue = (posRevenue + websiteRevenue) - refundedAmount;
    const totalShipping = websiteOrders.reduce((sum, order) => sum + (order.shippingCharges || 0), 0);
    const totalOrders = sales.length + websiteOrders.length;
    const lowStockItems = products.filter(p => (p.stock || 0) < (p.minStock || 0)).length;
    
    const customerPhones = new Set();
    sales.forEach(s => {
      if (s && s.customerPhone) {
        customerPhones.add(s.customerPhone);
      }
    });
    websiteOrders.forEach(o => {
      if (o && o.customer && o.customer.phone) {
        customerPhones.add(o.customer.phone);
      }
    });
    const totalCustomers = customerPhones.size || new Set(sales.filter(s => s && s.customer).map(s => s.customer)).size;

    const last7DaysArr = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const chartData = last7DaysArr.map(date => {
      const dailySales = sales.filter(s => {
        const saleDate = s.date instanceof Date ? s.date.toISOString().slice(0, 10) : String(s.date).slice(0, 10);
        return saleDate === date;
      });
      const dailyWebsiteOrders = websiteOrders.filter(o => {
        const orderDate = o.orderDate instanceof Date ? o.orderDate.toISOString().slice(0, 10) : String(o.orderDate).slice(0, 10);
        return orderDate === date;
      });
      const dailyReturns = returns.filter(r => {
        const rDate = (r as any).refundedAt || (r as any).processedAt || (r as any).createdAt;
        const returnDate = rDate ? (rDate instanceof Date ? rDate.toISOString().slice(0, 10) : String(rDate).slice(0, 10)) : "";
        return returnDate === date;
      });
      
      const dRevenue = dailySales.reduce((sum, s) => sum + (s.total || 0), 0) + dailyWebsiteOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const dRefunds = dailyReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);

      return {
        date,
        revenue: dRevenue - dRefunds,
        posRevenue: dailySales.reduce((sum, s) => sum + (s.total || 0), 0),
        websiteRevenue: dailyWebsiteOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      };
    });

    const totalIncomeFromTxns = transactions.filter((t: any) => t.type === "Income").reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const totalExpenseFromTxns = transactions.filter((t: any) => t.type === "Expense").reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    
    const productMap = new Map(products.map(p => [p._id?.toString() || (p as any).id?.toString(), p]));

    let totalItemProfit = 0;
    sales.forEach(sale => {
      if (!sale || !sale.items) return;
      sale.items.forEach(item => {
        if (!item) return;
        const product = productMap.get(item.productId?.toString());
        const buyPrice = product?.buyPrice || 0;
        const sellPrice = item.price || 0;
        const quantity = item.qty || 0;
        const revenue = sellPrice * quantity;
        const itemDiscount = sale.subtotal > 0 ? ((sale.discount || 0) / sale.subtotal) * revenue : 0;
        totalItemProfit += (revenue - (buyPrice * quantity) - itemDiscount);
      });
    });

    websiteOrders.forEach(order => {
      if (!order || !order.items) return;
      order.items.forEach(item => {
        if (!item) return;
        const product = productMap.get(item.productId?.toString());
        const buyPrice = product?.buyPrice || 0;
        const sellPrice = item.price || 0;
        const quantity = item.quantity || 0;

        let weightInGrams = 1000;
        const weightStr = ((item as any).selectedWeight || "").toString().toLowerCase();
        if (weightStr.includes('kg')) {
          const match = weightStr.match(/(\d+(\.\d+)?)\s*kg/);
          weightInGrams = match ? parseFloat(match[1]) * 1000 : 1000;
        } else if (weightStr.includes('g')) {
          const match = weightStr.match(/(\d+)\s*g/);
          weightInGrams = match ? parseFloat(match[1]) : 500;
        }

        let effectiveBuyPrice = buyPrice;
        if (product?.unit === 'kg') {
          effectiveBuyPrice = (buyPrice / 1000) * weightInGrams;
        }

        totalItemProfit += (sellPrice * quantity) - (effectiveBuyPrice * quantity);
      });
    });

    const uniqueTodaySales = Array.from(new Map(todaySalesData.map(s => [s._id?.toString(), s])).values());
    const uniqueTodayWebsiteOrders = Array.from(new Map(todayWebsiteOrders.map(o => [o._id?.toString(), o])).values());
    
    const todaySales = (uniqueTodaySales.reduce((sum, s) => sum + (s.total || 0), 0) + 
                       uniqueTodayWebsiteOrders.reduce((sum, o) => sum + (o.total || 0), 0)) - todayRefundedAmount;
    const todayShipping = uniqueTodayWebsiteOrders.reduce((sum, o) => sum + ((o as any).shippingCharges || 0), 0);
    const todayItemRevenue = todaySales - todayShipping;

    let todayProfit = 0;
    
    uniqueTodaySales.forEach(sale => {
      if (!sale || !sale.items) return;
      sale.items.forEach(item => {
        if (!item) return;
        const product = productMap.get(item.productId?.toString());
        const buyPrice = product?.buyPrice || 0;
        const sellPrice = item.price || 0;
        const quantity = item.qty || 0;
        
        const revenue = sellPrice * quantity;
        const itemDiscount = sale.subtotal > 0 ? ((sale.discount || 0) / sale.subtotal) * revenue : 0;
        const profit = (revenue - (buyPrice * quantity) - itemDiscount);
        
        todayProfit += profit;
      });
    });

    uniqueTodayWebsiteOrders.forEach(order => {
      if (!order || !order.items) return;
      order.items.forEach(item => {
        if (!item) return;
        const product = productMap.get(item.productId?.toString());
        const buyPrice = product?.buyPrice || 0;
        const sellPrice = item.price || 0;
        const quantity = item.quantity || 0;

        let weightInGrams = 1000;
        const weightStr = ((item as any).selectedWeight || "").toString().toLowerCase();
        if (weightStr.includes('kg')) {
          const match = weightStr.match(/(\d+(\.\d+)?)\s*kg/);
          weightInGrams = match ? parseFloat(match[1]) * 1000 : 1000;
        } else if (weightStr.includes('g')) {
          const match = weightStr.match(/(\d+)\s*g/);
          weightInGrams = match ? parseFloat(match[1]) : 500;
        }

        let effectiveBuyPrice = buyPrice;
        if (product?.unit === 'kg') {
          effectiveBuyPrice = (buyPrice / 1000) * weightInGrams;
        }

        const profit = (sellPrice - effectiveBuyPrice) * quantity;
        todayProfit += profit;
      });
    });

    if (todaySales <= 0 && todayRefundedAmount > 0) {
      todayProfit = 0;
    } else {
      todayProfit -= todayRefundedAmount;
    }

    todayProfit = Math.max(0, todayProfit);

    const finalNetProfit = totalItemProfit + totalIncomeFromTxns - totalExpenseFromTxns - refundedAmount;

    const totalStockValuePurchase = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.buyPrice || 0)), 0);
    const totalStockValueSell = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.sellPrice || 0)), 0);

    const recentSales = [
      ...sales.slice(-10).map(s => ({ ...s, id: (s as any)._id?.toString(), type: 'POS' })),
      ...websiteOrders.slice(-10).map(o => ({ 
        ...o, 
        id: (o as any)._id?.toString(),
        type: 'Website',
        customer: (o as any).customer ? `${(o as any).customer.firstName || ''} ${(o as any).customer.lastName || ''}`.trim() : 'Website Customer',
        date: (o as any).orderDate || (o as any).createdAt,
        status: (o as any).paymentStatus
      }))
    ].sort((a, b) => {
      const dateA = new Date((a as any).createdAt || (a as any).date || 0).getTime();
      const dateB = new Date((b as any).createdAt || (b as any).date || 0).getTime();
      return dateB - dateA;
    }).slice(0, 5);

    res.json({
      stats: {
        revenue: totalRevenue || 0,
        orders: totalOrders || 0,
        lowStock: lowStockItems || 0,
        customers: totalCustomers || 0,
        totalExpenses: totalExpenseFromTxns || 0,
        netProfit: finalNetProfit || 0,
        cashInHand: finalNetProfit || 0,
        totalShipping: totalShipping || 0
      },
      chartData: chartData || [],
      recentSales: recentSales || [],
      todaySales: todaySales || 0,
      todayItemRevenue: todayItemRevenue || 0,
      todayProfit: todayProfit || 0,
      todayShipping: todayShipping || 0,
      totalStockValuePurchase: totalStockValuePurchase || 0,
      totalStockValueSell: totalStockValueSell || 0
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error in Dashboard Stats",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};
