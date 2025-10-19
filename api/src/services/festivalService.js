const mongoose = require("mongoose");
const Festival = require("../models/festival");

class FestivalService {
  async getAllFestivals(
    page = 0,
    pageSize = 10,
    sortField = "title",
    sortOrder = "asc",
    search = ""
  ) {
    try {
      const filter = {};

      // Add search filter if provided
      if (search && search.trim() !== "") {
        filter.title = { $regex: search, $options: "i" };
      }

      // Build sort object
      const sort = {};
      const sortDirection = sortOrder.toLowerCase() === "desc" ? -1 : 1;
      sort[sortField] = sortDirection;

      // Calculate pagination
      const skip = page * pageSize;
      const limit = pageSize;

      // Get total count
      const totalElements = await Festival.countDocuments(filter);

      // Get festivals with pagination
      const content = await Festival.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Transform data to match Spring Boot response format
      const festivalDTO = content.map((festival) => ({
        id: festival._id,
        title: festival.title,
        image: festival.image,
        startTime: festival.start_time,
        endTime: festival.end_time,
        description: festival.description || "",
        location: festival.location || "",
      }));

      return {
        content: festivalDTO,
        totalElements,
        totalPages: Math.ceil(totalElements / pageSize) || 0,
        size: pageSize,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(totalElements / pageSize) - 1,
        numberOfElements: festivalDTO.length,
      };
    } catch (error) {
      throw new Error(`Failed to get festivals: ${error.message}`);
    }
  }

  async createFestival(festivalData) {
    try {
      // Validate required fields
      if (!festivalData.title || festivalData.title.trim() === "") {
        throw new Error("Title is required");
      }

      // Set default image if not provided
      if (!festivalData.image || festivalData.image.trim() === "") {
        festivalData.image = "default.jpg";
      }

      // Create festival object
      const festival = new Festival({
        title: festivalData.title,
        image: festivalData.image,
        start_time: festivalData.start_time,
        end_time: festivalData.end_time,
        description: festivalData.description || "",
        location: festivalData.location || "",
      });

      await festival.save();
      return festival;
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Validation error: ${error.message}`);
      }
      throw new Error(`Failed to create festival: ${error.message}`);
    }
  }

  async updateFestival(id, festivalData) {
    try {
      const festival = await Festival.findById(id);
      if (!festival) {
        throw new Error("Festival not found");
      }

      // Update fields
      if (festivalData.title !== undefined) {
        festival.title = festivalData.title;
      }
      if (festivalData.image !== undefined) {
        festival.image = festivalData.image;
      }
      if (festivalData.start_time !== undefined) {
        festival.start_time = festivalData.start_time;
      }
      if (festivalData.end_time !== undefined) {
        festival.end_time = festivalData.end_time;
      }
      if (festivalData.description !== undefined) {
        festival.description = festivalData.description || "";
      }
      if (festivalData.location !== undefined) {
        festival.location = festivalData.location || "";
      }

      await festival.save();
      return festival;
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Validation error: ${error.message}`);
      }
      throw new Error(`Failed to update festival: ${error.message}`);
    }
  }

  async updateImageFestival(id, imageUrl) {
    try {
      const festival = await Festival.findById(id);
      if (!festival) {
        throw new Error("Festival not found");
      }

      festival.image = imageUrl;
      await festival.save();
      return festival;
    } catch (error) {
      throw new Error(`Failed to update festival image: ${error.message}`);
    }
  }

  async getFestivalById(id) {
    try {
      const festival = await Festival.findById(id);
      if (!festival) {
        throw new Error("Festival not found");
      }
      return festival;
    } catch (error) {
      throw new Error(`Failed to get festival: ${error.message}`);
    }
  }

  async getFestivalDetail(id) {
    try {
      const festival = await Festival.findById(id);
      if (!festival) {
        return null;
      }

      return {
        id: festival._id,
        title: festival.title,
        image: festival.image,
        startTime: festival.start_time,
        endTime: festival.end_time,
        description: festival.description || "",
        location: festival.location || "",
      };
    } catch (error) {
      throw new Error(`Failed to get festival detail: ${error.message}`);
    }
  }

  async deleteFestival(id) {
    try {
      const festival = await Festival.findByIdAndDelete(id);
      if (!festival) {
        throw new Error("Festival not found");
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete festival: ${error.message}`);
    }
  }

  async getTopFestivals(limit = 5) {
    try {
      const festivals = await Festival.find({})
        .sort({ created_at: -1 })
        .limit(limit)
        .lean();

      return festivals.map((festival) => ({
        id: festival._id,
        title: festival.title,
        image: festival.image,
        startTime: festival.start_time,
        endTime: festival.end_time,
        description: festival.description || "",
        location: festival.location || "",
      }));
    } catch (error) {
      throw new Error(`Failed to get top festivals: ${error.message}`);
    }
  }
}

module.exports = new FestivalService();
