const AppError=require('./AppError');

class ValidationError extends AppError{
    constructor(
        message='Error de validacion',
        errorName='ValidationError',
        errorCode = 'VALIDATION_ERROR'

    ){
        super(message,400,'ValidationError')
    }
}

class MissingFieldError extends ValidationError{
    constructor(fieldName){
        super(
            `Campo requerido faltante: '${fieldName}'`,
            'MissingFieldError',
            'MISSING_FIELD'
        );
        this.errorName='MissingFieldError';
    }
}

class InvalidTypeError extends ValidationError {
    constructor(fieldName, expectedType) {
        super(
            `Campo '${fieldName}' debe ser de tipo ${expectedType}`,
            'InvalidTypeError',
            'INVALID_TYPE'
        );
        this.errorName = 'InvalidTypeError';
    }
}

class InvalidValueError extends ValidationError {
    constructor(fieldName, reason) {
        super(
            `Valor inválido en '${fieldName}': ${reason}`,
            'InvalidTypeError',
            'INVALID_TYPE'
        );
        this.errorName = 'InvalidValueError';
    }
}

class NotFoundError extends AppError{
    constructor(message='Recurso NO Encontrado'){
        super(message, 404, 'NotFoundError','NOT_FOUND');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflicto con el recurso') {
        super(
            message,
            409,
            'ConflictError',
            'CONFLICT'
        );
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(
            message,
            401,
            'UnauthorizedError',
            'UNAUTHORIZED'
        );
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Acceso prohibido') {
        super(
            message,
            403,
            'ForbiddenError',
            'FORBIDDEN'
        );
    }
}
module.exports={
    AppError,
    ValidationError,
    MissingFieldError,
    InvalidTypeError,
    InvalidValueError,
    NotFoundError,
    ConflictError,
    UnauthorizedError,
    ForbiddenError
}