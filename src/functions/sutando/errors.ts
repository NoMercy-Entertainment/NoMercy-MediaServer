export class BaseError extends Error {
	constructor(message, entity) {
		super(message);
		Error.captureStackTrace(this, this.constructor);

		this.name = this.constructor.name;
		this.message = message;
	}
}

export class ModelNotFoundError extends BaseError {}
export class RelationNotFoundError extends BaseError {}

export default {
	ModelNotFoundError,
	RelationNotFoundError,
};
