const prisma = require('../config/db');

const getDashboardAnalytics = async () => {
  const totalUsers = await prisma.user.count();
  const totalBookings = await prisma.booking.count();
  
  const revenueAggregation = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      status: 'SUCCESS'
    }
  });
  
  const totalRevenue = revenueAggregation._sum.amount || 0;

  // Example for top services: group by serviceId
  const topServices = await prisma.booking.groupBy({
    by: ['serviceId'],
    _count: {
      serviceId: true
    },
    orderBy: {
      _count: {
        serviceId: 'desc'
      }
    },
    take: 5
  });

  // Fetch actual service names
  const topServicesDetails = await Promise.all(
    topServices.map(async (ts) => {
      const service = await prisma.service.findUnique({
        where: { id: ts.serviceId },
        select: { name: true }
      });
      return {
        serviceName: service ? service.name : 'Unknown',
        bookingsCount: ts._count.serviceId
      };
    })
  );

  return {
    totalUsers,
    totalBookings,
    totalRevenue,
    topServices: topServicesDetails,
    conversionRate: totalUsers > 0 ? ((totalBookings / totalUsers) * 100).toFixed(2) + '%' : '0%'
  };
};

module.exports = { getDashboardAnalytics };
