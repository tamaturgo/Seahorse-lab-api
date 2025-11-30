// Domain Exceptions
// Exceções de domínio são independentes de framework e representam erros de negócio

export abstract class DomainException extends Error {
  abstract readonly code: string;
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundException extends DomainException {
  readonly code = 'ENTITY_NOT_FOUND';
  
  constructor(entityName: string, identifier?: string) {
    const message = identifier 
      ? `${entityName} com ID ${identifier} não encontrado`
      : `${entityName} não encontrado`;
    super(message);
  }
}

export class DuplicateEntityException extends DomainException {
  readonly code = 'DUPLICATE_ENTITY';
  
  constructor(entityName: string, field: string, value: string) {
    super(`${entityName} com ${field} "${value}" já existe`);
  }
}

export class InvalidOperationException extends DomainException {
  readonly code = 'INVALID_OPERATION';
  
  constructor(message: string) {
    super(message);
  }
}

export class ValidationException extends DomainException {
  readonly code = 'VALIDATION_ERROR';
  readonly errors: Record<string, string[]>;
  
  constructor(errors: Record<string, string[]>) {
    const message = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
      .join('; ');
    super(`Erro de validação: ${message}`);
    this.errors = errors;
  }
}

export class UnauthorizedException extends DomainException {
  readonly code = 'UNAUTHORIZED';
  
  constructor(message: string = 'Não autorizado') {
    super(message);
  }
}

export class ForbiddenException extends DomainException {
  readonly code = 'FORBIDDEN';
  
  constructor(message: string = 'Acesso negado') {
    super(message);
  }
}
