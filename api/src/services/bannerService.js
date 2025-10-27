const Banner = require("../models/banner");

class BannerService {
  async getAllBanners(
    search = "",
    is_active = "",
    sortBy = "created_at",
    page = 0,
    size = 10
  ) {
    try {
      const filter = {};

      // Add search filter if provided
      if (search && search.trim() !== "") {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { link: { $regex: search, $options: "i" } },
        ];
      }

      // Add is_active filter if provided
      if (is_active !== "") {
        filter.is_active = is_active === "true";
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = -1; // Default to descending order

      // Calculate pagination
      const skip = page * size;
      const limit = size;

      // Get total count
      const totalElements = await Banner.countDocuments(filter);

      // Get banners with pagination
      const content = await Banner.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Transform data
      const bannerDTO = content.map((banner) => ({
        id: banner._id,
        title: banner.title,
        image: banner.image,
        link: banner.link,
        isActive: banner.is_active,
        displayOrder: banner.display_order,
        createdAt: banner.created_at,
        updatedAt: banner.updated_at,
      }));

      return {
        content: bannerDTO,
        totalElements,
        totalPages: Math.ceil(totalElements / size) || 0,
        size: size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(totalElements / size) - 1,
        hasNext: page < Math.ceil(totalElements / size) - 1,
        hasPrevious: page > 0,
        numberOfElements: bannerDTO.length,
      };
    } catch (error) {
      throw new Error(`Failed to get banners: ${error.message}`);
    }
  }

  async getBannerById(id) {
    try {
      const banner = await Banner.findById(id);
      if (!banner) {
        throw new Error("Banner not found");
      }

      return {
        id: banner._id,
        title: banner.title,
        image: banner.image,
        link: banner.link,
        isActive: banner.is_active,
        displayOrder: banner.display_order,
        createdAt: banner.created_at,
        updatedAt: banner.updated_at,
      };
    } catch (error) {
      if (error.message === "Banner not found") {
        throw error;
      }
      throw new Error(`Failed to get banner: ${error.message}`);
    }
  }

  async createBanner(bannerData) {
    try {
      // Validate required fields
      if (!bannerData.title || !bannerData.image) {
        throw new Error("Title and image are required");
      }

      // Set default values
      const newBanner = new Banner({
        title: bannerData.title,
        image: bannerData.image,
        link: bannerData.link || "",
        is_active: bannerData.isActive !== undefined ? bannerData.isActive : true,
        display_order: bannerData.displayOrder || 0,
      });

      await newBanner.save();

      return {
        id: newBanner._id,
        title: newBanner.title,
        image: newBanner.image,
        link: newBanner.link,
        isActive: newBanner.is_active,
        displayOrder: newBanner.display_order,
        createdAt: newBanner.created_at,
        updatedAt: newBanner.updated_at,
      };
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Validation error: ${error.message}`);
      }
      throw new Error(`Failed to create banner: ${error.message}`);
    }
  }

  async updateBanner(id, updateData) {
    try {
      const banner = await Banner.findById(id);
      if (!banner) {
        throw new Error("Banner not found");
      }

      // Update fields
      if (updateData.title !== undefined) {
        banner.title = updateData.title;
      }
      if (updateData.image !== undefined) {
        banner.image = updateData.image;
      }
      if (updateData.link !== undefined) {
        banner.link = updateData.link;
      }
      if (updateData.isActive !== undefined) {
        banner.is_active = updateData.isActive;
      }
      if (updateData.displayOrder !== undefined) {
        banner.display_order = updateData.displayOrder;
      }

      await banner.save();

      return {
        id: banner._id,
        title: banner.title,
        image: banner.image,
        link: banner.link,
        isActive: banner.is_active,
        displayOrder: banner.display_order,
        createdAt: banner.created_at,
        updatedAt: banner.updated_at,
      };
    } catch (error) {
      if (error.message === "Banner not found") {
        throw error;
      }
      if (error.name === "ValidationError") {
        throw new Error(`Validation error: ${error.message}`);
      }
      throw new Error(`Failed to update banner: ${error.message}`);
    }
  }
}

module.exports = new BannerService();
