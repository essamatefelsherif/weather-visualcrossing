/**
 * @module  utilities-test
 * @desc	Testing module for the {@link module:utilities utilities} module.
 * @version 1.0.0
 * @author  Essam A. El-Sherif
 */

/* Import node.js core modules */
import assert from 'node:assert/strict';

/* Import the tested module */
import {updateObject, isValidObject, extractSubobjectByKeys} from '../lib/utils.js';

/* Prepare test environment */
let testCount   = 1;
let passCount   = 0;
let failCount   = 0;
let cancelCount = 0;
let skipCount   = 0;
let todoCount   = 0;
let startTime   = Date.now();

const suites = new Map();

/** @const {object} cmdOptions - Testing options. */
const cmdOptions = {
	node    : true,
    verbose : true,
};

/**
 * @func Main
 * @desc The application entry point function.
 */
(() => {
	loadTestData();

	if(cmdOptions.node){

		import('node:test')
			.then(runner => {
				cmdOptions.verbose = false;
				nodeRunner(runner);
			})	/* node:coverage disable */
			.catch((e) => {
				defRunner();
			});
	}
	else{
		defRunner();
	}	/* node:coverage enable */
})('Main Function');

/**
 * @func loadTestData
 * @desc Load test data.
 */
function loadTestData(){

	let testData = null;
	let suiteDesc = '';

	// TEST SUITE #1 - Test utilities functions
	suiteDesc = 'Test utilities functions';
	suites.set(suiteDesc, []);

	// TEST ### - Function updateObject()...test#1
	testData = {};

	testData.method = async () => {

		const originalDict = { name: 'Alice', age: 30, location: 'New York', email: 'alice@example.com' };
		const updatesDict  = { name: 'Alice Smith', age: 31, location: 'Los Angeles', email: 'alice.smith@example.com' };

		const keysToExclude = ['email'];
		const expectDict = { name: 'Alice Smith', age: 31, location: 'Los Angeles', email: 'alice@example.com' };

		updateObject(originalDict, updatesDict, keysToExclude);
		assert.deepStrictEqual(originalDict, expectDict);
	};
	testData.desc = 'Function updateObject()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST ### - Function isValidObject()...test#1
	testData = {};

	testData.method = async () => {

		const validDict = { name: 'Alice', age: 30 };
		const allowedKeys = ['name', 'age', 'email'];

		assert(isValidObject(validDict, allowedKeys));
	};
	testData.desc = 'Function isValidObject()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST ### - Function isValidObject()...test#2
	testData = {};

	testData.method = async () => {

		const invalidDict = { name: 'Bob', age: 25, location: 'City' };
		const allowedKeys = ['name', 'age', 'email'];

		assert(!isValidObject(invalidDict, allowedKeys));
	};
	testData.desc = 'Function isValidObject()...test#2';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST ### - Function isValidObject()...test#3
	testData = {};

	testData.method = async () => {

		const notDict = ['name', 'Alice'];
		const allowedKeys = ['name', 'age', 'email'];

		assert(!isValidObject(notDict, allowedKeys));
	};
	testData.desc = 'Function isValidObject()...test#3';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST ### - Function extractSubobjectByKeys()...test#1
	testData = {};

	testData.method = async () => {

		const originalDict = {
			name: 'John Doe',
			age: 30,
			email: 'johndoe@example.com',
			country: 'USA'
		};
		const keysList = ['name', 'email'];

		const subDict = extractSubobjectByKeys(originalDict, keysList);

		assert.deepStrictEqual(subDict, { name: 'John Doe', email: 'johndoe@example.com' });
	};
	testData.desc = 'Function extractSubobjectByKeys()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);
}

/**
 * @func  nodeRunner
 * @param {object} runner - The node core module 'node:test' object.
 * @desc  Carry out the loaded tests using node test runner.
 */
function nodeRunner(runner){

	for(let [suiteDesc, suiteTests] of suites){
		runner.suite(suiteDesc, () => {
			for(let cmdObj of suiteTests){
				runner.test(cmdObj.desc, {skip: cmdObj.skip}, async () => {
					await makeTest(cmdObj);
				});
			}
		});
	}
}
/* node:coverage disable */

/**
 * @func  defRunner
 * @desc  Carry out the loaded tests using this developed test runner.
 */
function defRunner(){

	cmdOptions.verbose && process.on('exit', () => {
		console.log();
		console.log('▶ tests',       --testCount);
		console.log('▶ suites',      suites.size);
		console.log('▶ pass',        passCount);
		console.log('▶ fail',        failCount);
		console.log('▶ cancelled',   cancelCount);
		console.log('▶ skipped',     skipCount);
		console.log('▶ todo',        todoCount);
		console.log('▶ duration_ms', Math.round(Date.now() - startTime));
	});

	cmdOptions.verbose && console.error();
	for(let [suiteDesc, suiteTests] of suites)
		for(let cmdObj of suiteTests)
			if(!cmdObj.skip){
				(async() => {
					await makeTest(cmdObj);
				})();
			}

	cmdOptions.verbose && console.log();
}
/* node:coverage enable */

/**
 * @func  makeTest
 * async
 * @param {object} obj - The test data object.
 * @desc  Carry out a single test.
 */
async function makeTest(obj){

	const testID   = testCount++;

	let preMsg = `Test#${(testID).toString().padStart(3, '0')} ... `;
	let postMsg = preMsg;

	preMsg += `Initiate ... ${obj.desc}`;
	cmdOptions.verbose && console.error(preMsg);

	if(!cmdOptions.verbose){
		await obj.method();
	}	/* node:coverage disable */
	else{
		try{
			await obj.method();
			passCount++;

			postMsg += `Success  ... ${obj.desc}`;
			cmdOptions.verbose && console.error(postMsg);
		}
		catch(e){
			failCount++;

			postMsg += `Failure  ... ${obj.desc}`;
			cmdOptions.verbose && console.error(postMsg);
		}
	}	/* node:coverage enable */
}
