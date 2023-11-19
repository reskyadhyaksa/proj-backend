import Products from "../models/ProductModel.js";
import ProductAnalytics from "../models/ProductAnalyticsModel.js"
import { Sequelize } from 'sequelize';
import { Op } from "sequelize";
import querystring from 'querystring';
import fs from "fs";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Products.findAll({
            attributes: [
                'id',
                'uuid',
                'name',
                'category',
                'image',
                'price',
                'description',
                'stock',
                'isHot_deal',
                'shopee_link',
                'tokopedia_link',
                'count_view',
                'shopee_click',
                'tokopedia_click'
            ],
        });

        const response = products.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        console.log(response);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
}


export const getProducts = async (req, res) => {
    try {
        // Check if a query string exists in the URL
      const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';

      // Replace %20 with + in the query string
      const modifiedQuery = queryString.replace(/%20/g, '+');

      const queryObject = querystring.parse(modifiedQuery);

      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        categories = [], 
        search = '',
        minPrice,
        maxPrice,
      } = queryObject;

      const categoryOptions = [
        'Alat Make Up',
        'Box Kado',
        'Figura',
        'Alat Tulis',
        'Pernak-pernik',
        'Kertas Daur Ulang',
      ];

      const validatedPage = Math.max(1, parseInt(page));
      const validatedLimit = Math.min(50, Math.max(1, parseInt(limit)));
      const validatedCategories = categoryOptions.filter(option => categories.includes(option));
      const validatedSortBy = ['name', 'price', 'date'].includes(sortBy)
        ? sortBy
        : 'name';
      const validatedSortOrder = ['asc', 'desc'].includes(sortOrder)
        ? sortOrder
        : 'asc';

      const order = [[validatedSortBy, validatedSortOrder]];

      const where = {};

      if (validatedCategories.length > 0) {
        where.category = { [Sequelize.Op.in]: validatedCategories };
      }

      if (search) {
        where.name = { [Sequelize.Op.like]: `%${search}%` };
      }

      if (minPrice !== undefined && maxPrice !== undefined) {
        where.price = { [Sequelize.Op.between]: [minPrice, maxPrice] };
      } else if (minPrice !== undefined) {
        where.price = { [Sequelize.Op.gte]: minPrice };
      } else if (maxPrice !== undefined) {
        where.price = { [Sequelize.Op.lte]: maxPrice };
      }

      const products = await Products.findAndCountAll({
        attributes: [
          'id',
          'uuid',
          'name',
          'category',
          'image',
          'price',
          'description',
          'stock',
          'isHot_deal',
          'shopee_link',
          'tokopedia_link',
          'count_view',
          'shopee_click',
          'tokopedia_click'
        ],
        where,
        order,
        limit: validatedLimit,
        offset: (validatedPage - 1) * validatedLimit,
      });

      const totalPages = Math.ceil(products.count / validatedLimit);

      const response = {
        error: false,
        totalProducts: products.count,
        page: validatedPage,
        limit: validatedLimit,
        categories: categoryOptions,
        products: products.rows.map(product => ({
          ...product.toJSON(),
          image: product.image.split(',').map(path => path.replace(/\\/g, '\\')),
        })),
        totalPages,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const getSingleProduct = async (req, res) => {
    try {
        const { productId, slug } = req.query;
        let product;

        if (productId) {
            product = await Products.findOne({
                where: {
                    uuid: productId
                },
                attributes: [
                    'id',
                    'uuid',
                    'name',
                    'category',
                    'image',
                    'price',
                    'description',
                    'stock',
                    'isHot_deal',
                    'shopee_link',
                    'tokopedia_link',
                    'count_view',
                    'shopee_click',
                    'tokopedia_click'
                ],
            });
        } else if (slug) {
            const productName = slug.replace(/-/g, ' ');

            product = await Products.findOne({
                where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), productName.toLowerCase()),
                attributes: [
                    'id',
                    'uuid',
                    'name',
                    'category',
                    'image',
                    'price',
                    'description',
                    'stock',
                    'isHot_deal',
                    'shopee_link',
                    'tokopedia_link',
                    'count_view',
                    'shopee_click',
                    'tokopedia_click'
                ],
            });

            if (product) {
                await product.increment('count_view');
            }
        }

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const response = {
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

export const getSimilarProduct = async (req, res) => {
    const productId = req.query.productId;
    try {
        const originalProduct = await Products.findOne({
            where: {
                uuid: productId
            },
            attributes: ['category']
        });

        if (!originalProduct) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const similarProducts = await Products.findAll({
            where: {
                category: originalProduct.category,
                uuid: {
                    [Op.not]: productId
                }
            },
            attributes: [
                'id',
                'uuid',
                'name',
                'category',
                'image',
                'price',
                'description',
                'stock',
                'isHot_deal',
                'shopee_link',
                'tokopedia_link',
                'count_view',
                'shopee_click',
                'tokopedia_click'
            ],
        });

        const response = similarProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch similar products" });
    }
}

export const createProduct = async (req, res) => {
    // console.log("Request Files:", req.files); // Log the contents of req.files
    // console.log("Request Body:", req.body);

    if (req.fileValidationError) {
        return res.status(400).json({ msg: req.fileValidationError.message });
    }

    const {
        name, category, price, description, stock,
        shopee_link, tokopedia_link
    } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: "No Image Uploaded" });
    }

    const uploadedImages = req.files.map(file => {
        const fileName = file.filename;
        const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
        return url;
    });

    try {
        const existingProduct = await Products.findOne({
            where: {
                name: name
            }
        });

        if (existingProduct) {
            return res.status(400).json({ msg: "Product with the same name already exists" });
        }

        const imageUrlString = uploadedImages.join(',');

        const newProduct = await Products.create({
            userId: 1,
            name,
            category,
            image: imageUrlString,
            price,
            description,
            stock,
            isHot_deal: false,
            shopee_link,
            tokopedia_link,
            count_view: 0,
            shopee_click: 0,
            tokopedia_click: 0
        });

        res.status(200).json({ msg: "Product Created Successfully", data: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const productId = req.query.productId;

    const {
        name, category, price, description, stock, shopee_link, tokopedia_link
    } = req.body;

    try {
        const product = await Products.findOne({
            where: {
                uuid: productId
            }
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        let updatedImage = "";
        if(req.files === null){
            updatedImage = product.image;
        } else {
            const imageUrls = product.image.split(',');
            const imageFileNames = imageUrls.map(imageUrl => {
                const urlParts = imageUrl.split('/');
                return urlParts[urlParts.length - 1];
            });

            imageFileNames.forEach(imageFileName => {
                const imagePath = `./public/images/${imageFileName}`;
                fs.unlinkSync(imagePath);
            });

            updatedImage = req.files.map(file => {
                const fileName = file.filename;
                const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
                return url;
            });
        }

        const imageUrlString = updatedImage.join(',');
        
        await product.update({
            name,
            category,
            image: imageUrlString,
            price,
            description,
            stock,
            shopee_link,
            tokopedia_link
        });

        
        const updatedProduct = await Products.findOne({
            where: {
                uuid: productId
            }
        });

        res.status(200).json({ msg: "Product Updated Successfully", data: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    const productId = req.query.productId;

    try {
        const product = await Products.findOne({
            where: {
                uuid: productId
            }
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const imageUrls = product.image.split(',');
        const imageFileNames = imageUrls.map(imageUrl => {
            const urlParts = imageUrl.split('/');
            return urlParts[urlParts.length - 1];
        });

        imageFileNames.forEach(imageFileName => {
            const imagePath = `./public/images/${imageFileName}`;
            fs.unlinkSync(imagePath);
        });

        const deletedProductName = product.name; // Get the name of the deleted product
        await product.destroy();

        res.status(200).json({ msg: "Product Deleted Successfully", deletedProductId: productId, deletedProductName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete product" });
    }
};

export const updateHotDeal = async (req, res) => {
    const productId = req.query.productId;
  
    try {
      const product = await Products.findOne({
        where: {
          uuid: productId,
        },
      });
  
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }
  
      await product.update({
        isHot_deal: !product.isHot_deal,
      });
      res.status(200).json({
        msg: 'Hot Deal status updated successfully',
        product: {
            uuid: product.uuid,
            name: product.name,
            isHot_deal: product.isHot_deal,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to toggle Hot Deal status' });
    }
  };
  


export const getBestSellerProducts = async (req, res) => {
    try {
        const bestSellerProducts = await Products.findAll({
            order: [[Sequelize.literal('shopee_click + tokopedia_click'), 'DESC']],
            limit: 10,
            attributes: [
                'id',
                'uuid',
                'name',
                'category',
                'image',
                'price',
                'description',
                'stock',
                'isHot_deal',
                'shopee_link',
                'tokopedia_link',
                'count_view',
                'shopee_click',
                'tokopedia_click'
            ],
        });

        const response = bestSellerProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch best-selling products" });
    }
};


export const getHotDealProducts = async (req, res) => {
    try {
        const hotDealProducts = await Products.findAll({
            where: {
                isHot_deal: true
            },
            attributes: [
                'id',
                'uuid',
                'name',
                'category',
                'image',
                'price',
                'description',
                'stock',
                'isHot_deal',
                'shopee_link',
                'tokopedia_link',
                'count_view',
                'shopee_click',
                'tokopedia_click'
            ],
        });

        if (!hotDealProducts || hotDealProducts.length === 0) {
            return res.status(404).json({ msg: "Hot deal products not found" });
        }

        const response = hotDealProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch hot deal products" });
    }
};

export const getNewCollectionProducts = async (req, res) => {
    try {
        const newCollectionProducts = await Products.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
            attributes: [
                'id',
                'uuid',
                'name',
                'category',
                'image',
                'price',
                'description',
                'stock',
                'isHot_deal',
                'shopee_link',
                'tokopedia_link',
                'count_view',
                'shopee_click',
                'tokopedia_click'
            ],
        });
        if (!newCollectionProducts) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const response = newCollectionProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch new collection products" });
    }
};

export const getMostViewedProducts = async (req, res) => {
    try {
        const mostViewedProducts = await Products.findAll({
            order: [['count_view', 'DESC']],
            limit: 10,
            attributes: [
                'id',
                'uuid',
                'name',
                'category',
                'image',
                'price',
                'description',
                'stock',
                'isHot_deal',
                'shopee_link',
                'tokopedia_link',
                'count_view',
                'shopee_click',
                'tokopedia_click'
            ],
        });

        const response = mostViewedProducts.map(product => ({
            ...product.toJSON(),
            image: product.image.split(',').map(path => path.replace(/\\/g, '\\'))
        }));

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch most viewed products" });
    }
};

export const incrShopeeClick = async (req, res) => {
    const productId = req.params.productId;
    const date = req.query.date; // Date in 'YYYY-MM-DD' format
  
    try {
      const product = await Products.findOne({
        where: {
          uuid: productId
        }
      });
  
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      await product.increment("shopee_click");
  
      // Update analytics data
      let analyticsEntry = await ProductAnalytics.findOne({
        where: {
          date: date
        }
      });
  
      if (!analyticsEntry) {
        analyticsEntry = await ProductAnalytics.create({
          date: date,
          dayNumber: (new Date(date).getDay() % 7) + 1,
          shopee_click: 1,
          tokopedia_click: 0
        });
      } else {
        await analyticsEntry.increment("shopee_click");
      }
  
      res.status(200).json({ message: "Shopee click and analytics updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update shopee click and analytics" });
    }
};

export const incrTokopediaClick = async (req, res) => {
    const productId = req.params.productId;
    const date = req.query.date; // Date in 'YYYY-MM-DD' format
  
    try {
      const product = await Products.findOne({
        where: {
          uuid: productId
        }
      });
  
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      await product.increment("tokopedia_click");
  
      // Update analytics data
      let analyticsEntry = await ProductAnalytics.findOne({
        where: {
          date: date
        }
      });
  
      if (!analyticsEntry) {
        analyticsEntry = await ProductAnalytics.create({
          date: date,
          dayNumber: (new Date(date).getDay() % 7) + 1,
          shopee_click: 0, // Initialize with 0 click
          tokopedia_click: 1
        });
      } else {
        await analyticsEntry.increment("tokopedia_click");
      }
  
      res.status(200).json({ message: "Tokopedia click and analytics updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update tokopedia click and analytics" });
    }
};