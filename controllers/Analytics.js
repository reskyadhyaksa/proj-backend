import ProductAnalytics from "../models/ProductAnalyticsModel.js"
import WebAnalytics from "../models/WebAnalyticsModel.js"
import { Sequelize } from 'sequelize';
import { Op } from "sequelize";
import { getISOWeek } from 'date-fns';

export const trackWebVisitors = async (req, res) => {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  try {
      const [AnalyticsData, created] = await WebAnalytics.findOrCreate({
          where: { month, year },
          defaults: { month, year }
      });

      if (!created) {
          await WebAnalytics.increment('web_visitors', {
              where: { month, year }
          });
      }

      res.status(200).json({ msg: "Web visitors successfully incremented" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Failed to increment web visitors" });
  }
};

export const getWebVistors =  async (req, res) => {
  const currentYear = new Date().getFullYear();

  try {
      const AnalyticsData = await WebAnalytics.findAll({
          where: { year: currentYear },
          attributes: ['month', 'web_visitors']
      });

      if (!AnalyticsData || AnalyticsData.length === 0) {
          return res.status(404).json({ error: "Web analytics data not found for the current year" });
      }

      res.json(AnalyticsData);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch web analytics data" });
  }
};

export const getMonthlyData = async (req, res) => {
    try {
      const monthlyData = await ProductAnalytics.findAll({
        attributes: [
          [Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
          [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
          [Sequelize.fn('SUM', Sequelize.col('shopee_click')), 'totalShopeeClicks'],
          [Sequelize.fn('SUM', Sequelize.col('tokopedia_click')), 'totalTokopediaClicks']
        ],
        group: ['year', 'month'],
        order: ['year', 'month']
      });
  
      const formattedData = [];
      let currentYear = null;
      let yearData = null;
  
      monthlyData.forEach((data) => {
        if (data.dataValues.year !== currentYear) {
          yearData = {
            year: data.dataValues.year,
            data: []
          };
          formattedData.push(yearData);
          currentYear = data.dataValues.year;
        }
  
        yearData.data.push({
          month: data.dataValues.month,
          totalShopeeClicks: data.dataValues.totalShopeeClicks,
          totalTokopediaClicks: data.dataValues.totalTokopediaClicks
        });
      });
  
      res.json(formattedData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching monthly data.' });
    }
};

export const getWeeklyData = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentWeek = getISOWeek(currentDate);

        const weeklyData = await ProductAnalytics.findAll({
            attributes: [
                [Sequelize.fn('DAYOFWEEK', Sequelize.col('date')), 'dayNumber'],
                [Sequelize.fn('sum', Sequelize.col('shopee_click')), 'totalShopeeClicks'],
                [Sequelize.fn('sum', Sequelize.col('tokopedia_click')), 'totalTokopediaClicks']
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), currentDate.getFullYear()),
                    Sequelize.where(Sequelize.fn('WEEK', Sequelize.col('date')), currentWeek),
                ]
            },
            group: ['dayNumber'],
            order: ['dayNumber']
        });

        res.json(weeklyData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching weekly data.' });
    }
};
  
export const getTotalLinkClicks = async (req, res) => {
    try {
      const totalLinkClicks = await ProductAnalytics.sum('shopee_click') + await ProductAnalytics.sum('tokopedia_click');
      res.json({ totalLinkClicks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching total link clicks.' });
    }
};
  