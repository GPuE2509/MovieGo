const mongoose = require("mongoose");
const User = require("../models/user");

class UserManagementService {
  async getAllUsers(
    search,
    status,
    sortBy = "created_at",
    page = 0,
    size = 10
  ) {
    try {
      const filter = {};

      // Add search filter if provided
      if (search && search.trim() !== "") {
        filter.$or = [
          { email: { $regex: search, $options: "i" } },
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
        ];
      }

      // Add status filter if provided
      if (status) {
        filter.status = status;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = -1; // Default to descending order

      // Calculate pagination
      const skip = page * size;
      const limit = size;

      // Get total count
      const totalElements = await User.countDocuments(filter);

      // Get users with pagination
      const content = await User.find(filter)
        .populate("roles")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Check for expired bans and update status
      const now = new Date();
      const usersToUpdate = [];

      // Transform data and check for expired bans
      const userDTO = content.map((user) => {
        // Check if ban has expired
        if (
          user.status === "BLOCKED" &&
          user.ban_until &&
          new Date(user.ban_until) < now
        ) {
          usersToUpdate.push({
            _id: user._id,
            status: "ACTIVE",
            ban_until: null,
          });
          user.status = "ACTIVE";
          user.ban_until = null;
        }

        return {
          id: user._id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
          status: user.status,
          points: user.point,
          banUntil: user.ban_until,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          roles: user.roles ? user.roles.map((role) => role.role_name) : [],
        };
      });

      // Update users with expired bans
      if (usersToUpdate.length > 0) {
        await Promise.all(
          usersToUpdate.map((update) =>
            User.findByIdAndUpdate(update._id, {
              status: update.status,
              ban_until: update.ban_until,
            })
          )
        );
      }

      return {
        content: userDTO,
        totalElements,
        totalPages: Math.ceil(totalElements / size) || 0,
        size: size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(totalElements / size) - 1,
        hasNext: page < Math.ceil(totalElements / size) - 1,
        hasPrevious: page > 0,
        numberOfElements: userDTO.length,
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findById(id).populate("roles");
      if (!user) {
        throw new Error("User not found");
      }

      // Check if ban has expired
      if (
        user.status === "BLOCKED" &&
        user.ban_until &&
        user.ban_until < new Date()
      ) {
        user.status = "ACTIVE";
        user.ban_until = null;
        await user.save();
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async updateUserStatus(id, statusData) {
    try {
      const user = await this.getUserById(id);

      user.status = statusData.status;
      if (statusData.status === "BLOCKED" && statusData.ban_until) {
        user.ban_until = statusData.ban_until;
      } else {
        user.ban_until = null;
      }

      await user.save();

      return {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        status: user.status,
        points: user.point,
        banUntil: user.ban_until,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        roles: user.roles ? user.roles.map((role) => role.role_name) : [],
      };
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }
}

module.exports = new UserManagementService();
