import _ from 'lodash';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

export const now = (format = 'YYYY-MM-DD HH:mm:ss') => dayjs().format(format);

export const getRelationName = (relationMethod) => {
	// 'relation' length 8
	return relationMethod.substring(8).toLowerCase();
};

export const getScopeName = (scopeMethod) => {
	// 'scope' length 5
	return scopeMethod.substring(5).toLowerCase();
};

export const getRelationMethod = (relation) => {
	return _.camelCase(`relation_${relation}`);
};

export const getScopeMethod = (scope) => {
	return _.camelCase(`scope_${scope}`);
};

export const getAttrMethod = (attr) => {
	return _.camelCase(`get_${attr}_attribute`);
};

export const getGetterMethod = (attr) => {
	return _.camelCase(`get_${attr}_attribute`);
};

export const getSetterMethod = (attr) => {
	return _.camelCase(`set_${attr}_attribute`);
};

export const getAttrName = (attrMethod) => {
	return attrMethod.substring(3, attrMethod.length - 9).toLowerCase();
};

export const tap = (instance, callback) => {
	const result = callback(instance);
	return result instanceof Promise
		? result.then(() => instance)
		: instance;
};

export default {
	now,
	getRelationName,
	getScopeName,
	getRelationMethod,
	getScopeMethod,
	getAttrMethod,
	getGetterMethod,
	getSetterMethod,
	getAttrName,
	tap,
};
