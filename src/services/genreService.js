import { Op } from 'sequelize';
import { Genre } from '../models/index.js';

class GenreService {
  // Get all genres
  async getAllGenres() {
    return await Genre.findAll({
      order: [['name', 'ASC']]
    });
  }

  // Add new genre
  async addGenre(genreData) {
    // Check if genre name already exists
    const existingGenre = await Genre.findOne({
      where: { name: genreData.name }
    });

    if (existingGenre) {
      throw new Error(`Genre with name ${genreData.name} already exists`);
    }

    return await Genre.create(genreData);
  }

  // Update genre
  async updateGenre(id, genreData) {
    const existingGenre = await Genre.findByPk(id);
    
    if (!existingGenre) {
      throw new Error('Genre not found');
    }

    // Check if new name already exists (excluding current genre)
    if (genreData.name !== existingGenre.name) {
      const duplicateGenre = await Genre.findOne({
        where: { 
          name: genreData.name,
          id: { [Op.ne]: id }
        }
      });

      if (duplicateGenre) {
        throw new Error(`Genre with name ${genreData.name} already exists`);
      }
    }

    await existingGenre.update(genreData);
    return existingGenre;
  }

  // Delete genre
  async deleteGenre(id) {
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      throw new Error('Genre not found');
    }

    await genre.destroy();
    return true;
  }

  // Find genres by IDs
  async findGenresByIds(ids) {
    return await Genre.findAll({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });
  }

  // Get genre by ID
  async getGenreById(id) {
    const genre = await Genre.findByPk(id);
    
    if (!genre) {
      throw new Error('Genre not found');
    }

    return genre;
  }
}

export default new GenreService();
