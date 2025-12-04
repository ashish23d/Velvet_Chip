import React, { useMemo } from 'react';
import { Order } from '../../types.ts';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface SalesChartProps {
    orders: Order[];
    timeRange: '7d' | '30d' | '1y' | 'all';
}

const SalesChart: React.FC<SalesChartProps> = ({ orders, timeRange }) => {
    const salesData = useMemo(() => {
        const now = new Date();
        let dataPoints: { name: string; sales: number; date: string }[] = [];

        if (timeRange === '7d') {
            // Last 7 days
            dataPoints = Array(7).fill(0).map((_, i) => {
                const d = new Date();
                d.setDate(now.getDate() - (6 - i));
                return {
                    name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    sales: 0,
                    date: d.toISOString().split('T')[0]
                };
            });
        } else if (timeRange === '30d') {
            // Last 30 days
            dataPoints = Array(30).fill(0).map((_, i) => {
                const d = new Date();
                d.setDate(now.getDate() - (29 - i));
                return {
                    name: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                    sales: 0,
                    date: d.toISOString().split('T')[0]
                };
            });
        } else if (timeRange === '1y') {
            // Last 12 months
            dataPoints = Array(12).fill(0).map((_, i) => {
                const d = new Date();
                d.setMonth(now.getMonth() - (11 - i));
                return {
                    name: d.toLocaleDateString('en-US', { month: 'short' }),
                    sales: 0,
                    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                };
            });
        } else if (timeRange === 'all') {
            // All time - group by month
            // Find min date
            if (orders.length === 0) return [];
            const dates = orders.map(o => new Date(o.orderDate).getTime());
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(); // up to now

            const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
            const numMonths = Math.max(monthsDiff, 1); // at least 1 month

            dataPoints = Array(numMonths).fill(0).map((_, i) => {
                const d = new Date(minDate);
                d.setMonth(d.getMonth() + i);
                return {
                    name: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    sales: 0,
                    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                };
            });
        }

        orders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            const orderDateStr = orderDate.toISOString().split('T')[0];
            const orderMonthStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

            if (timeRange === '1y' || timeRange === 'all') {
                const point = dataPoints.find(p => p.date === orderMonthStr);
                if (point) point.sales += order.totalAmount;
            } else {
                const point = dataPoints.find(p => p.date === orderDateStr);
                if (point) point.sales += order.totalAmount;
            }
        });

        return dataPoints;
    }, [orders, timeRange]);

    const hasData = salesData.some(d => d.sales > 0);

    if (!hasData) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-[400px] flex flex-col justify-center items-center">
                <p className="text-gray-500">No sales data available for this period.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-[400px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Sales Trends</h3>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C22255" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#C22255" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                            interval={timeRange === '30d' ? 6 : 0}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#C22255"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;