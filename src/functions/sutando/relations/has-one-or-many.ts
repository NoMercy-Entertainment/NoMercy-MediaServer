import collect from 'collect.js';
import Collection from '../collection';
import { tap } from '../utils';

export function getRelationValue(dictionary, key, type) {
	const value = dictionary[key];

	return type === 'one'
		? value[0]
		: new Collection(value);
}

export function matchOneOrMany(models, results, relation, type) {
	const dictionary = this.buildDictionary(results);

	models.map((model) => {
		const key = model.attributes[this.localKey];
		if (dictionary[key] !== undefined) {
			model.relations[relation] = this.getRelationValue(dictionary, key, type);
		}
	});

	return models;
}

export function buildDictionary(results) {
	const foreign = this.getForeignKeyName();

	return collect(results).mapToDictionary(result => [result[foreign], result])
		.all();
}

export async function save(model) {
	this.setForeignAttributesForCreate(model);

	return await model.save()
		? model
		: false;
}

export async function saveMany(models) {
	await Promise.all(models.map(async (model) => {
		await this.save(model);
	}));

	return models instanceof Collection
		? models
		: new Collection(models);
}

export async function create(attributes = {}) {
	return await tap(this.related.constructor.init(attributes), async (instance) => {
		this.setForeignAttributesForCreate(instance);

		await instance.save();
	});
}

export async function createMany(records) {
	const instances = await Promise.all(records.map(async (record) => {
		return await this.create(record);
	}));

	return instances instanceof Collection
		? instances
		: new Collection(instances);
}

export function setForeignAttributesForCreate(model) {
	model[this.getForeignKeyName()] = this.getParentKey();
}

export function getForeignKeyName() {
	const segments = this.getQualifiedForeignKeyName().split('.');

	return segments[segments.length - 1];
}

export function getParentKey() {
	return this.parent.attributes[this.localKey];
}

export function getQualifiedForeignKeyName() {
	return this.foreignKey;
}

export function getExistenceCompareKey() {
	return this.getQualifiedForeignKeyName();
}

export function addConstraints() {
	if (this.constructor.constraints) {
		query = this.getRelationQuery();

		query.where(this.foreignKey, '=', this.getParentKey());

		query.whereNotNull(this.foreignKey);
	}
}

export default {
	getRelationValue,
	matchOneOrMany,
	buildDictionary,
	setForeignAttributesForCreate,
	create,
	createMany,
	save,
	saveMany,
	getForeignKeyName,
	getParentKey,
	getQualifiedForeignKeyName,
	getExistenceCompareKey,
	addConstraints,
};
