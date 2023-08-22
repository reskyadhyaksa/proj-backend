import Analytics from "../models/AnalyticsModel.js"

export const trackWebVisitors = async (req, res, next) => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; 
    const year = currentDate.getFullYear();

    try {
        const [AnalyticsData, created] = await Analytics.findOrCreate({
            where: { month, year },
            defaults: { month, year }
        });

        if (!created) {
            await Analytics.increment('web_visitors', {
                where: { month, year }
            });
        }

        next();
    } catch (error) {
        console.error(error);
        next();
    }
};
