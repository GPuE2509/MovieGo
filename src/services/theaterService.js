import { Op } from 'sequelize';
import { Theater } from '../models/index.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

class TheaterService {
  // Get all theaters with pagination and search
  async getAllTheaters(page = 0, pageSize = 10, sortField = 'name', sortOrder = 'asc', keyword = '') {
    const offset = page * pageSize;
    const limit = pageSize;
    
    // Build where clause for search
    const whereClause = {
      deleted: false
    };
    
    if (keyword) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { location: { [Op.like]: `%${keyword}%` } },
        { state: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    // Build order clause
    const orderClause = [[sortField, sortOrder.toUpperCase()]];
    
    // Get total count
    const total = await Theater.count({ where: whereClause });
    
    // Get paginated data
    const theaters = await Theater.findAll({
      where: whereClause,
      order: orderClause,
      limit,
      offset
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages - 1;
    const hasPrevious = page > 0;
    
    return {
      total,
      page,
      size: pageSize,
      totalPages,
      hasNext,
      hasPrevious,
      data: theaters.map(theater => ({
        id: theater.id,
        name: theater.name,
        location: theater.location,
        phone: theater.phone,
        state: theater.state,
        imageUrl: theater.image
      }))
    };
  }

  // Get theater by ID
  async getTheaterById(id) {
    const theater = await Theater.findOne({
      where: {
        id: id,
        deleted: false
      }
    });
    
    if (!theater) {
      throw new Error('Theater not found with id: ' + id + ' or deleted');
    }
    
    return {
      id: theater.id,
      name: theater.name,
      location: theater.location,
      phone: theater.phone,
      latitude: theater.latitude,
      longitude: theater.longitude,
      state: theater.state,
      imageUrl: theater.image
    };
  }

  // Create new theater
  async createTheater(theaterData, imageFile = null) {
    // Check if theater name already exists
    const existingTheater = await Theater.findOne({
      where: {
        name: theaterData.name,
        deleted: false
      }
    });

    if (existingTheater) {
      throw new Error('Theater name ' + theaterData.name + ' already exists');
    }

    let imageUrl = null;
    
    // Upload image if provided
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
    }
    
    const theater = await Theater.create({
      name: theaterData.name,
      location: theaterData.location,
      phone: theaterData.phone,
      latitude: theaterData.latitude,
      longitude: theaterData.longitude,
      state: theaterData.state,
      image: imageUrl,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      id: theater.id,
      name: theater.name,
      location: theater.location,
      phone: theater.phone,
      latitude: theater.latitude,
      longitude: theater.longitude,
      state: theater.state,
      imageUrl: theater.image
    };
  }

  // Update theater
  async updateTheater(id, theaterData, imageFile = null) {
    const theater = await Theater.findOne({
      where: {
        id: id,
        deleted: false
      }
    });
    
    if (!theater) {
      throw new Error('Theater not found with id: ' + id + ' or deleted');
    }

    // Check if new name already exists (excluding current theater)
    if (theaterData.name !== theater.name) {
      const existingTheater = await Theater.findOne({
        where: {
          name: theaterData.name,
          deleted: false,
          id: { [Op.ne]: id }
        }
      });

      if (existingTheater) {
        throw new Error('Theater name ' + theaterData.name + ' already exists');
      }
    }

    // Upload new image if provided
    if (imageFile) {
      const imageUrl = await uploadToCloudinary(imageFile);
      theater.image = imageUrl;
    }
    
    // Update other fields
    if (theaterData.name !== undefined) {
      theater.name = theaterData.name;
    }
    if (theaterData.location !== undefined) {
      theater.location = theaterData.location;
    }
    if (theaterData.phone !== undefined) {
      theater.phone = theaterData.phone;
    }
    if (theaterData.latitude !== undefined) {
      theater.latitude = theaterData.latitude;
    }
    if (theaterData.longitude !== undefined) {
      theater.longitude = theaterData.longitude;
    }
    if (theaterData.state !== undefined) {
      theater.state = theaterData.state;
    }
    
    theater.updatedAt = new Date();
    await theater.save();
    
    return {
      id: theater.id,
      name: theater.name,
      location: theater.location,
      phone: theater.phone,
      latitude: theater.latitude,
      longitude: theater.longitude,
      state: theater.state,
      imageUrl: theater.image
    };
  }

  // Delete theater (soft delete)
  async deleteTheater(id) {
    const theater = await Theater.findOne({
      where: {
        id: id,
        deleted: false
      }
    });
    
    if (!theater) {
      throw new Error('Theater not found with id: ' + id + ' or already deleted');
    }

    // TODO: Also soft delete related screens when Screen model is implemented
    // For now, just soft delete the theater
    
    theater.deleted = true;
    theater.updatedAt = new Date();
    await theater.save();
    
    return true;
  }

  // Get theaters near a location (for public API)
  async getTheatersNear(lat, lon, radiusKm = 5, date, limit = 10) {
    // This is a simplified version. In a real implementation, you would:
    // 1. Calculate distance using Haversine formula
    // 2. Filter theaters within radius
    // 3. Check for showtimes on the given date
    // 4. Sort by distance
    
    const theaters = await Theater.findAll({
      where: {
        deleted: false
      },
      limit: limit
    });
    
    // Calculate distance and filter (simplified)
    const theatersWithDistance = theaters.map(theater => {
      const distance = this.calculateDistance(lat, lon, theater.latitude, theater.longitude);
      return {
        id: theater.id,
        name: theater.name,
        location: theater.location,
        phone: theater.phone,
        state: theater.state,
        imageUrl: theater.image,
        latitude: theater.latitude,
        longitude: theater.longitude,
        distance: distance
      };
    }).filter(theater => theater.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return theatersWithDistance;
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

export default new TheaterService();
