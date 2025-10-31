
import { Request, Response } from 'express';
import { Movie } from '../models/Movie';
import { 
  CreateMovieRequest, 
  UpdateMovieRequest, 
  MovieSearchFilters,
  MovieSortBy,
  SortOrder 
} from '../types/movie.types';
import { ApiResponse, PaginatedResponse, AuthenticatedRequest, HttpStatusCode, PaginationQuery } from '../types/api.types';
import { cloudinaryService } from '../services/cloudinaryService';


export const getMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = MovieSortBy.CREATED_AT,
      order = SortOrder.DESC,
    } = req.query as PaginationQuery & { sort?: MovieSortBy; order?: string };

    const {
      genre,
      releaseYear,
      minRating,
      language,
      director,
    } = req.query as MovieSearchFilters;

    const filter: any = { isActive: true };

    if (genre && Array.isArray(genre)) {
      filter.genre = { $in: genre };
    }

    if (releaseYear) {
      const startOfYear = new Date(releaseYear, 0, 1);
      const endOfYear = new Date(releaseYear, 11, 31, 23, 59, 59);
      filter.releaseDate = { $gte: startOfYear, $lte: endOfYear };
    }

    if (minRating) {
      filter['rating.average'] = { $gte: minRating };
    }

    if (language) {
      filter.language = language;
    }

    if (director) {
      filter.director = new RegExp(director, 'i');
    }

    
    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    
    const [movies, totalItems] = await Promise.all([
      Movie.find(filter)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Movie.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / Number(limit));
    const currentPage = Number(page);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Movies retrieved successfully',
      data: movies,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: Number(limit),
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve movies',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const getMovieById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie || !movie.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    await Movie.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Movie retrieved successfully',
      data: movie,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get movie by ID error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve movie',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const searchMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query, limit = 20 } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Search query is required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const movies = await Movie.searchMovies(query, { limit: Number(limit) });

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Search completed successfully',
      data: movies,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to search movies',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const getTrendingMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.getTrending(Number(limit));

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Trending movies retrieved successfully',
      data: movies,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get trending movies error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve trending movies',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const createMovie = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const movieData: CreateMovieRequest = req.body;

    const movie = new Movie(movieData);
    await movie.save();

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to create movie',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const updateMovie = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateMovieRequest = req.body;

    const movie = await Movie.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to update movie',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const deleteMovie = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    
    const movie = await Movie.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Movie deleted successfully',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to delete movie',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const getMovieVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { duration = 3600, width, height, quality = 'auto' } = req.query;

    const movie = await Movie.findById(id);

    if (!movie || !movie.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (!movie.cloudinaryVideoId) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Video not available for this movie',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const signedUrl = cloudinaryService.generateSignedVideoUrl(movie.cloudinaryVideoId, {
      duration: Number(duration),
      transformation: {
        width: width ? Number(width) : undefined,
        height: height ? Number(height) : undefined,
        quality: quality as string,
        format: 'mp4'
      }
    });

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Video URL generated successfully',
      data: {
        videoUrl: signedUrl,
        expiresIn: Number(duration),
        movieId: movie._id,
        title: movie.title,
        duration: movie.duration
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get movie video error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to generate video URL',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const getMovieVideoInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie || !movie.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (!movie.cloudinaryVideoId) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Video not available for this movie',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const videoInfo = await cloudinaryService.getVideoInfo(movie.cloudinaryVideoId);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Video info retrieved successfully',
      data: {
        movieId: movie._id,
        title: movie.title,
        cloudinaryVideoId: movie.cloudinaryVideoId,
        duration: videoInfo.duration,
        width: videoInfo.width,
        height: videoInfo.height,
        format: videoInfo.format,
        createdAt: videoInfo.created_at
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get movie video info error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to get video info',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};