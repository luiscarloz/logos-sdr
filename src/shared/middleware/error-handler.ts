import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/index.js';
import { Logger } from '../utils/logger.js';

export function createErrorHandler(logger: Logger) {
  return function errorHandler(
    error: FastifyError | Error,
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    // Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: error.flatten().fieldErrors,
      });
    }

    // App errors (NotFound, Unauthorized, etc.)
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
        code: error.code,
      });
    }

    // Fastify errors (404, etc.)
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }

    // Unexpected errors
    logger.error({ err: error, url: request.url, method: request.method }, 'Unhandled error');
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    });
  };
}
