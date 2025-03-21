/**
 * @module  utilities
 * @desc    A set of utilities functions.
 * @version 1.0.0
 * @author  Essam A. El-Sherif
 */

/**
 * @func   updateObject
 * @static
 * @param  {Object} original - The original Object to update.
 * @param  {Object} updates - The Object with update values.
 * @param  {Array} excludeKeys - A list of keys to exclude from updating.
 * @desc   Update the original Object with values from the updates Object, excluding keys specified in excludeKeys.
 */
export function updateObject(original, updates, excludeKeys = []){
	for(const [key, value] of Object.entries(updates)){
		if(!excludeKeys.includes(key)){
			original[key] = value;
		}
	}
}

/**
 * @func   isValidObject
 * @static
 * @param  {Object} variable - The variable to check.
 * @param  {Array} allowedKeys - A list of allowed keys.
 * @return {boolean} - True if variable is an Object and all keys are in allowedKeys, false otherwise.
 * @desc   Check if the variable is an Object and if all its keys are in the allowed keys.
 */
export function isValidObject(variable, allowedKeys){
	if(typeof variable === 'object' && !Array.isArray(variable) && variable !== null){
		return Object.keys(variable).every(key => allowedKeys.includes(key));
	}
	return false;
}

/**
 * @func   extractSubobjectByKeys
 * @static
 * @param  {Object} originalDict - The original Object to extract from.
 * @param  {Array} keysList - A list of keys to include in the sub-Object.
 * @return {Object} - A sub-Object containing only the specified keys.
 * @desc   Extract a sub-Object from the original Object with keys specified in keysList.
 */
export function extractSubobjectByKeys(originalDict, keysList){
	const subDict = {};
	keysList.forEach((key) => {
		if(key in originalDict){
			subDict[key] = originalDict[key];
		}
	});
	return subDict;
}
