import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {
    ArrowTrendingUpIcon,
    BanknotesIcon,
    ShoppingBagIcon,
    ArrowPathIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

const AnalyticsPage: React.FC = () => {
    const { adminData } = useAppContext();

    if (!adminData) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { orders, products, returns, users } = adminData;

    // --- Calculations ---

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalReturns = returns.filter(r => r.status === 'Approved').reduce((sum, r) => sum + (r.refund_amount || 0), 0);
    const returnRate = totalSales > 0 ? (totalReturns / totalSales) * 100 : 0;

    // Sales Trend Data (Monthly)
    const salesTrendData = useMemo(() => {
        const data: { [key: string]: number } = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize with 0
        months.forEach(m => data[m] = 0);

        orders.forEach(order => {
            const date = new Date(order.orderDate);
            const month = months[date.getMonth()];
            data[month] += order.totalAmount;
        });

        return months.map(month => ({ name: month, sales: data[month] }));
    }, [orders]);

    // Top Selling Products
    const topProducts = useMemo(() => {
        const productSales: { [key: string]: { name: string, sales: number, quantity: number } } = {};

        orders.forEach(order => {
            order.items.forEach((item: any) => {
                if (!productSales[item.product.id]) {
                    productSales[item.product.id] = {
                        name: item.product.name,
                        sales: 0,
                        quantity: 0
                    };
                }
                productSales[item.product.id].sales += item.product.price * item.quantity;
                productSales[item.product.id].quantity += item.quantity;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    }, [orders]);

    // Order Status Distribution
    const orderStatusData = useMemo(() => {
        const statusCounts: { [key: string]: number } = {};
        orders.forEach(order => {
            const status = order.currentStatus || 'Processing';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [orders]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="space-y-8 p-6">
            <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Sales"
                    value={`₹${totalSales.toLocaleString('en-IN')}`}
                    icon={<BanknotesIcon className="h-6 w-6 text-green-600" />}
                    trend="+12.5%" // Mock trend for now
                    trendUp={true}
                />
                <MetricCard
                    title="Total Orders"
                    value={totalOrders.toString()}
                    icon={<ShoppingBagIcon className="h-6 w-6 text-blue-600" />}
                    trend="+5.2%"
                    trendUp={true}
                />
                <MetricCard
                    title="Avg. Order Value"
                    value={`₹${Math.round(averageOrderValue).toLocaleString('en-IN')}`}
                    icon={<ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />}
                    trend="-2.1%"
                    trendUp={false}
                />
                <MetricCard
                    title="Returns Rate"
                    value={`${returnRate.toFixed(1)}%`}
                    icon={<ArrowPathIcon className="h-6 w-6 text-red-600" />}
                    trend="+0.5%"
                    trendUp={false} // Increase in returns is bad
                    inverse={true}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Trend Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly Sales Trend</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrendData}>
                                <defs>
                                    <linearGradient id="colorSalesAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C22255" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#C22255" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#C22255" fillOpacity={1} fill="url(#colorSalesAnalytics)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Status Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Top Selling Products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4 text-right">Units Sold</th>
                                <th className="px-6 py-4 text-right">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topProducts.map((product, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-right">{product.quantity}</td>
                                    <td className="px-6 py-4 text-right">₹{product.sales.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Metric Cards
const MetricCard = ({ title, value, icon, trend, trendUp, inverse }: any) => {
    const isPositive = inverse ? !trendUp : trendUp;
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
    const trendBg = isPositive ? 'bg-green-50' : 'bg-red-50';

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendBg} ${trendColor}`}>
                    {trend}
                </span>
                <span className="text-xs text-gray-400 ml-2">vs last month</span>
            </div>
        </div>
    );
};

export default AnalyticsPage;
