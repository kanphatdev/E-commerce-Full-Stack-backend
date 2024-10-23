const prisma = require("../config/prisma");
const cloudinary =require ("cloudinary").v2;
exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => {
            asset_id: item.asset_id;
            public_id: item.public_id;
            url: item.url;
            secure_url: item.secure_url;
          }),
        },
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating product" });
  }
};
exports.list = async (req, res) => {
  try {
    const { count } = req.params;

    // Fetch products from the database, ordered by the creation date
    const products = await prisma.product.findMany({
      take: parseInt(count), // Limit the number of products fetched
      orderBy: {
        createdAt: "desc", // Order by the most recent products first
      },
      include: {
        category: true, // Include the category associated with the product
        images: true, // Include the images associated with the product
      },
    });

    // Send the fetched products as the response
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
      await prisma.image.deleteMany({
        where:{
            productId:Number(req.params.id),
        }
      })

    const product = await prisma.product.update({
        where:{
            id:Number(req.params.id),
        },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => {
            asset_id: item.asset_id;
            public_id: item.public_id;
            url: item.url;
            secure_url: item.secure_url;
          }),
        },
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching " });
  }
};
exports.read = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch products from the database, ordered by the creation date
    const products = await prisma.product.findFirst({
      where:{
id:Number(id)
      },
  
      include: {
        category: true, // Include the category associated with the product
        images: true, // Include the images associated with the product
      },
    });

    // Send the fetched products as the response
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error " });
  }
};
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    // หนังชีวิต

    await prisma.product.delete({
        where:{
            id:Number(id) ,
        }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error " });
  }
};
exports.listby = async (req, res) => {
  try {
    const { sort,order,limit } = req.body;
    const products = await prisma.product.findMany({
        take:limit,
        orderBy:{[sort]:order},
        include:{
            category:true,


        }
    })
        // Send the fetched products as the response
        res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error " });
  }
};
const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "search query error" });
  }
};
const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "search price error" });
  }
};
const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "search price error" });
  }
};
exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;
    // search by query string
    if (query) {
      await handleQuery(req, res, query);
      console.log("query", query);
    }

    // ----------------------
    // search by category
    if (category) {
      await handleCategory(req, res, category);
      console.log("category", category);
    }

    // -------------------
    // search by product price
    if (price) {
      await handlePrice(req, res, price);
      console.log("price", price);
    }

    // --------------------------------
    // res.send("searchFilters product");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});
exports.createImages = async (req, res) => {
    try {
        //code
        // console.log(req.body)
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `Akatsuki-${Date.now()}`,
            resource_type: 'auto',
            folder: 'Ecom2024'
        })
        res.send(result)
    } catch (err) {
        //err
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
exports.removeImage = async (req, res) => {
    try {
        //code
        const { public_id } = req.body
        // console.log(public_id)
        cloudinary.uploader.destroy(public_id, (result) => {
            res.send('Remove Image Success!!!')
        })

    } catch (err) {
        //err
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}