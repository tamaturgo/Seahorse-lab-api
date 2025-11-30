import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { Response } from 'express';
import { 
  DomainException,
  EntityNotFoundException,
  DuplicateEntityException,
  InvalidOperationException,
  ValidationException,
  UnauthorizedException,
  ForbiddenException
} from '../../domain/exceptions';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  code: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const { statusCode, error } = this.mapExceptionToHttpStatus(exception);
    
    const errorResponse: ErrorResponse = {
      statusCode,
      message: exception.message,
      error,
      code: exception.code,
      timestamp: new Date().toISOString(),
    };

    // Adiciona erros de validação se existirem
    if (exception instanceof ValidationException) {
      errorResponse.errors = exception.errors;
    }

    this.logger.warn(`Domain Exception: ${exception.code} - ${exception.message}`);
    
    response.status(statusCode).json(errorResponse);
  }

  private mapExceptionToHttpStatus(exception: DomainException): { statusCode: number; error: string } {
    if (exception instanceof EntityNotFoundException) {
      return { statusCode: HttpStatus.NOT_FOUND, error: 'Not Found' };
    }
    
    if (exception instanceof DuplicateEntityException) {
      return { statusCode: HttpStatus.CONFLICT, error: 'Conflict' };
    }
    
    if (exception instanceof InvalidOperationException) {
      return { statusCode: HttpStatus.BAD_REQUEST, error: 'Bad Request' };
    }
    
    if (exception instanceof ValidationException) {
      return { statusCode: HttpStatus.UNPROCESSABLE_ENTITY, error: 'Unprocessable Entity' };
    }
    
    if (exception instanceof UnauthorizedException) {
      return { statusCode: HttpStatus.UNAUTHORIZED, error: 'Unauthorized' };
    }
    
    if (exception instanceof ForbiddenException) {
      return { statusCode: HttpStatus.FORBIDDEN, error: 'Forbidden' };
    }
    
    // Exceção de domínio genérica
    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Internal Server Error' };
  }
}
