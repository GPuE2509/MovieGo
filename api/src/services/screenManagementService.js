const mongoose = require("mongoose");
const Screen = require("../models/screen");
const Theater = require("../models/theater");
const ShowTime = require("../models/showtime");

class ScreenManagementService {
  async getAllScreens(
    search,
    status,
    theaterId,
    sortBy = "created_at",
    page = 0,
    size = 10
  ) {
    try {
      const filter = {};

      if (search && search.trim() !== "") {
        filter.name = { $regex: search, $options: "i" };
      }

      if (status) {
        filter.is_active = status === "ACTIVE";
      }

      if (theaterId) {
        filter.theater_id = theaterId;
      }

      const allowedSort = ["created_at", "updated_at", "name", "capacity"];
      const sortField = allowedSort.includes(sortBy) ? sortBy : "created_at";
      const sort = {};
      sort[sortField] = -1;

      const skip = page * size;
      const limit = size;

      const totalElements = await Screen.countDocuments(filter);
      const content = await Screen.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const screenDTO = content.map((screen) => ({
        id: screen._id,
        name: screen.name,
        theaterId: screen.theater_id,
        capacity: screen.capacity,
        screenType: screen.screen_type,
        isActive: screen.is_active,
        createdAt: screen.created_at,
        updatedAt: screen.updated_at,
      }));

      return {
        content: screenDTO,
        totalElements,
        totalPages: Math.ceil(totalElements / size) || 0,
        size: size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(totalElements / size) - 1,
        hasNext: page < Math.ceil(totalElements / size) - 1,
        hasPrevious: page > 0,
        numberOfElements: screenDTO.length,
      };
    } catch (error) {
      throw new Error(`Failed to get screens: ${error.message}`);
    }
  }

  async getScreenById(id) {
    try {
      const screen = await Screen.findById(id);
      if (!screen) {
        throw new Error("Screen not found");
      }

      return {
        id: screen._id,
        name: screen.name,
        theaterId: screen.theater_id,
        capacity: screen.capacity,
        screenType: screen.screen_type,
        isActive: screen.is_active,
        createdAt: screen.created_at,
        updatedAt: screen.updated_at,
      };
    } catch (error) {
      throw new Error(`Failed to get screen: ${error.message}`);
    }
  }

  async createScreen(data) {
    try {
      if (!data.name) {
        throw new Error("Name is required");
      }
      if (!data.theater_id) {
        throw new Error("Theater is required");
      }
      if (!mongoose.Types.ObjectId.isValid(data.theater_id)) {
        throw new Error("Invalid theater ID");
      }
      const theater = await Theater.findById(data.theater_id);
      if (!theater) {
        throw new Error("Theater not found");
      }
      if (!data.capacity || Number(data.capacity) < 1) {
        throw new Error("Capacity must be at least 1");
      }

      const screen = new Screen({
        name: data.name,
        theater_id: data.theater_id,
        capacity: data.capacity,
        screen_type: data.screen_type || "STANDARD",
        is_active: data.is_active !== undefined ? data.is_active : true,
      });
      await screen.save();

      return {
        id: screen._id,
        name: screen.name,
        theaterId: screen.theater_id,
        capacity: screen.capacity,
        screenType: screen.screen_type,
        isActive: screen.is_active,
        createdAt: screen.created_at,
        updatedAt: screen.updated_at,
      };
    } catch (error) {
      throw new Error(`Failed to create screen: ${error.message}`);
    }
  }

  async updateScreen(id, updateData) {
    try {
      const screen = await Screen.findById(id);
      if (!screen) {
        throw new Error("Screen not found");
      }

      if (updateData.theater_id) {
        if (!mongoose.Types.ObjectId.isValid(updateData.theater_id)) {
          throw new Error("Invalid theater ID");
        }
        const theater = await Theater.findById(updateData.theater_id);
        if (!theater) {
          throw new Error("Theater not found");
        }
      }
      if (updateData.capacity !== undefined && Number(updateData.capacity) < 1) {
        throw new Error("Capacity must be at least 1");
      }

      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          screen[key] = updateData[key];
        }
      });

      await screen.save();

      return {
        id: screen._id,
        name: screen.name,
        theaterId: screen.theater_id,
        capacity: screen.capacity,
        screenType: screen.screen_type,
        isActive: screen.is_active,
        createdAt: screen.created_at,
        updatedAt: screen.updated_at,
      };
    } catch (error) {
      throw new Error(`Failed to update screen: ${error.message}`);
    }
  }

  async updateScreenStatus(id, isActive) {
    try {
      const screen = await Screen.findById(id);
      if (!screen) {
        throw new Error("Screen not found");
      }
      screen.is_active = Boolean(isActive);
      await screen.save();
      return {
        id: screen._id,
        isActive: screen.is_active,
      };
    } catch (error) {
      throw new Error(`Failed to update screen status: ${error.message}`);
    }
  }

  async deleteScreen(id) {
    try {
      const screen = await Screen.findById(id);
      if (!screen) {
        throw new Error("Screen not found");
      }

      const showtimeExists = await ShowTime.exists({ screen_id: id });
      if (showtimeExists) {
        throw new Error("Cannot delete screen with existing showtimes");
      }

      await Screen.findByIdAndDelete(id);
      return { message: "Screen deleted successfully", id };
    } catch (error) {
      throw new Error(`Failed to delete screen: ${error.message}`);
    }
  }
}

module.exports = new ScreenManagementService();


