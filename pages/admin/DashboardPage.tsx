import React from 'react';
import MetricCard from '../../components/admin/MetricCard.tsx';
import SalesChart from '../../components/admin/SalesChart.tsx';
import RecentActivity from '../../components/admin/RecentActivity.tsx';
// import { useAppContext } from '../../context/AppContext.tsx'; // Replaced
import { useAdminDashboardData } from '../../services/api/admin.api';
import { CurrencyDollarIcon, ShoppingCartIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Order, UserProfile, ReturnRequest } from '../../types.ts';

const DashboardPage: React.FC = () => {
    // Use real-time hook
    const { data, isLoading } = useAdminDashboardData();
    const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '1y' | 'all'>('all');

    if (isLoading || !data) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
    }

    // Map raw DB data to expected types
    const orders = data.orders.map((o: any) => ({
        ...o,
        orderDate: o.order_date, // Map snake_case to camelCase
        totalAmount: o.total_amount,
        shippingAddress: o.shipping_address, // Map shipping address
        customerName: o.customer_name,
        customerEmail: o.customer_email
    })) as Order[];

    const users = data.users as UserProfile[]; // Assuming profiles match mostly or adequate for usage
    const returns = data.returns as ReturnRequest[];

    // Helper to get date range
    const getDateRange = (range: '7d' | '30d' | '1y' | 'all', offset = 0) => {
        const end = new Date();
        const start = new Date();

        if (range === '7d') {
            end.setDate(end.getDate() - (offset * 7));
            start.setDate(start.getDate() - ((offset + 1) * 7));
        } else if (range === '30d') {
            end.setDate(end.getDate() - (offset * 30));
            start.setDate(start.getDate() - ((offset + 1) * 30));
        } else if (range === '1y') {
            end.setFullYear(end.getFullYear() - offset);
            start.setFullYear(start.getFullYear() - (offset + 1));
        } else {
            // 'all' case - just set start to way back
            start.setFullYear(2000);
            if (offset > 0) {
                // For 'prev' in 'all', we can't really compare, so maybe return same or empty
                // Let's just return a range that results in 0 for comparison
                start.setFullYear(1900);
                end.setFullYear(1900);
            }
        }
        return { start, end };
    };

    // Calculate Metrics
    const calculateMetrics = (range: '7d' | '30d' | '1y' | 'all') => {
        const currentRange = getDateRange(range, 0);
        const prevRange = getDateRange(range, 1);

        const filterOrders = (start: Date, end: Date) =>
            orders.filter(o => {
                const d = new Date(o.orderDate);
                return d >= start && d < end;
            });

        const filterReturns = (start: Date, end: Date) =>
            returns.filter(r => {
                const d = new Date(r.updated_at || r.return_requested_at);
                return d >= start && d < end && r.status === 'Approved';
            });

        const currentOrders = filterOrders(currentRange.start, currentRange.end);
        const prevOrders = filterOrders(prevRange.start, prevRange.end);

        const currentReturns = filterReturns(currentRange.start, currentRange.end);
        const prevReturns = filterReturns(prevRange.start, prevRange.end);

        // Gross Revenue
        const currentGross = currentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const prevGross = prevOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        // Returns Value (using refund_amount if available, else estimating from order total - crude approximation if partial return logic isn't fully exposed in 'returns' list, but 'refund_amount' should be there)
        const currentReturnsValue = currentReturns.reduce((sum, r) => sum + (r.refund_amount || 0), 0);
        const prevReturnsValue = prevReturns.reduce((sum, r) => sum + (r.refund_amount || 0), 0);

        // Net Revenue
        const currentNet = currentGross - currentReturnsValue;
        const prevNet = prevGross - prevReturnsValue;

        // Growth Rates
        const calculateGrowth = (current: number, prev: number) => {
            if (prev === 0) return current > 0 ? 100 : 0;
            return ((current - prev) / prev) * 100;
        };

        return {
            grossRevenue: { value: currentGross, growth: calculateGrowth(currentGross, prevGross) },
            returns: { value: currentReturnsValue, growth: calculateGrowth(currentReturnsValue, prevReturnsValue) },
            netRevenue: { value: currentNet, growth: calculateGrowth(currentNet, prevNet) },
            ordersCount: { value: currentOrders.length, growth: calculateGrowth(currentOrders.length, prevOrders.length) }
        };
    };

    const metrics = calculateMetrics(timeRange);

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    {(['7d', '30d', '1y', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeRange === range
                                ? 'bg-pink-50 text-pink-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '1y' ? 'Last Year' : 'Total'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Gross Revenue"
                    value={`₹${Math.round(metrics.grossRevenue.value).toLocaleString('en-IN')}`}
                    change={parseFloat(metrics.grossRevenue.growth.toFixed(1))}
                    icon={<CurrencyDollarIcon className="h-6 w-6" />}
                />
                <MetricCard
                    title="Returns"
                    value={`₹${Math.round(metrics.returns.value).toLocaleString('en-IN')}`}
                    change={parseFloat(metrics.returns.growth.toFixed(1))}
                    icon={<UsersIcon className="h-6 w-6" />} // Using UsersIcon as placeholder, maybe change to something more appropriate like ArrowPathIcon if available
                    inverse={true} // Red is bad for returns usually, but growth in returns is definitely bad
                />
                <MetricCard
                    title="Net Revenue"
                    value={`₹${Math.round(metrics.netRevenue.value).toLocaleString('en-IN')}`}
                    change={parseFloat(metrics.netRevenue.growth.toFixed(1))}
                    icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
                />
                <MetricCard
                    title="Total Orders"
                    value={metrics.ordersCount.value.toString()}
                    change={parseFloat(metrics.ordersCount.growth.toFixed(1))}
                    icon={<ShoppingCartIcon className="h-6 w-6" />}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <SalesChart orders={orders} timeRange={timeRange} />
                </div>
                <div>
                    <RecentActivity orders={orders} users={users} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;