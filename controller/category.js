const prisma = require("../config/prisma");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate that the category name is provided
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Create new category in the database
    const category = await prisma.category.create({
      data: {
        name: name,
      },
    });

    // Send the created category in response
    res.status(201).json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating category" });
  }
};

exports.list = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await prisma.category.findMany();

    // Send the list of categories in response
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

exports.remove = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Delete the category based on the ID provided in the request parameters
      const category = await prisma.category.delete({
        where: {
          id: Number(id), // Ensure the ID is cast to a number if it's coming as a string
        },
      });
  
      // Send confirmation message after deletion
      res.status(200).json({ message: "Category removed successfully", category });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error removing category" });
    }
  };
  
