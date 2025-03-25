/**
 * @module  weather-test
 * @desc	Testing module for the {@link module:weather weather} module.
 * @version 1.0.0
 * @author  Essam A. El-Sherif
 */

/* Import node.js core modules */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath }  from 'node:url';
import { dirname, join }  from 'node:path';

/* Import the tested module */
import { Weather } from '../lib/weather.js';

/* Emulate commonJS __filename and __dirname constants */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    verbose : false,
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

	let key = join(__dirname, '../.api-key');
	try{
		key = fs.readFileSync(key, {encoding: 'utf8'});
	}
	catch(e){
		key = '';
	}

	let sample_01_url = join(__dirname, './fixtures/sample_01.url');
	sample_01_url = fs.readFileSync(sample_01_url, {encoding: 'utf8'});

	let sample_01 = join(__dirname, './fixtures/sample_01.json');
	sample_01 = fs.readFileSync(sample_01, {encoding: 'utf8'});

	let sample_02_url = join(__dirname, './fixtures/sample_02.url');
	sample_02_url = fs.readFileSync(sample_02_url, {encoding: 'utf8'});

	let sample_02 = join(__dirname, './fixtures/sample_02.json');
	sample_02 = fs.readFileSync(sample_02, {encoding: 'utf8'});

	let sampleActive = sample_01;

	// TEST SUITE #1 - Test Weather Static Methods
	suiteDesc = 'Test Weather Static Methods';
	suites.set(suiteDesc, []);

	// TEST #01 - Static method Weather.filterItemByDatetimeVal()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let datetime1 = sample.days[0].datetime;
		let res1 = Weather.filterItemByDatetimeVal(sample.days, datetime1);

		assert.strictEqual(typeof res1, 'object');
		assert.strictEqual(res1.datetime, datetime1);

		let datetime2 = sample.days[0].hours[0].datetime;
		let res2 = Weather.filterItemByDatetimeVal(res1.hours, datetime2);

		assert.strictEqual(typeof res2, 'object');
		assert.strictEqual(res2.datetime, datetime2);

		assert.strictEqual(Weather.filterItemByDatetimeVal(sample.days, '1970-01-01'), null);
		assert.throws(
			() => {
				Weather.filterItemByDatetimeVal(sample.days, false);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.filterItemByDatetimeVal: Invalid input datetime value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Static method Weather.filterItemByDatetimeVal()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Static method Weather.setItemByDatetimeVal()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let datetime1 = sample.days[0].datetime;
		Weather.setItemByDatetimeVal(sample.days, datetime1, { datetimeISO: new Date(datetime1).toISOString() });

		assert.strictEqual(sample.days[0].datetimeISO, new Date(datetime1).toISOString());

		let datetime2 = 0;
		Weather.setItemByDatetimeVal(sample.days, datetime2, { datetimeGMT: new Date(datetime1).toGMTString() });

		assert.strictEqual(sample.days[0].datetimeGMT, new Date(datetime1).toGMTString());

		assert.throws(
			() => {
				Weather.setItemByDatetimeVal(sample.days, datetime1, false);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setItemByDatetimeVal: Invalid input data value 'false'.`);
				return true;
			}
		);

		assert.throws(
			() => {
				Weather.setItemByDatetimeVal(sample.days, false, {});
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setItemByDatetimeVal: Invalid input datetime value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Static method Weather.setItemByDatetimeVal()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #03 - Static method Weather.updateItemByDatetimeVal()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let datetime1 = sample.days[0].datetime;
		Weather.updateItemByDatetimeVal(sample.days, datetime1, { datetimeISO: new Date(datetime1).toISOString() });

		let datetime2 = 0;
		Weather.updateItemByDatetimeVal(sample.days, datetime2, { datetimeGMT: new Date(datetime1).toGMTString() });

		assert.strictEqual(sample.days[0].datetimeGMT, new Date(datetime1).toGMTString());

		assert.throws(
			() => {
				Weather.updateItemByDatetimeVal(sample.days, datetime1, false);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.updateItemByDatetimeVal: Invalid input data value 'false'.`);
				return true;
			}
		);

		assert.throws(
			() => {
				Weather.updateItemByDatetimeVal(sample.days, false, {});
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.updateItemByDatetimeVal: Invalid input datetime value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Static method Weather.updateItemByDatetimeVal()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #04 - Static method Weather.validateParamDate()...test#1
	testData = {};

	testData.method = async () => {

		// validate dynamic dates
		[
			'today',
			'tomorrow',
			'yesterday',
			'yeartodate',
			'monthtodate',
			'lastyear',
			'last24hours',
			'nextweekend',
			'lastweekend',
			'next10days',
			'last10days',
			'nextsunday',
			'lastsaturday',

		].forEach(param => { assert.strictEqual(Weather.validateParamDate(param), param) });

		// validate date and datetime formats
		[
			'2024-03-07',
			'2024-03-07T04:30:00',

		].forEach(param => { assert.strictEqual(Weather.validateParamDate(param), param) });

		// validate datetimeEpoch
		assert.strictEqual(Weather.validateParamDate(Date.parse('2025-03-07')), Date.parse('2025-03-07'));

		// invalid date parameter
		assert.throws(
			() => {
				Weather.validateParamDate(false);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.validateParamDate: Invalid date type 'boolean'.`);
				return true;
			}
		);

		assert.throws(
			() => {
				Weather.validateParamDate('TODAY');
			},
			(err) => {
				assert(err instanceof Error);
				assert.strictEqual(err.message, `Weather.validateParamDate: Invalid date 'TODAY'.`);
				return true;
			}
		);

		assert.throws(
			() => {
				Weather.validateParamDate('25-03-07');
			},
			(err) => {
				assert(err instanceof Error);
				assert.strictEqual(err.message, `Weather.validateParamDate: Invalid date '25-03-07'.`);
				return true;
			}
		);

		assert.throws(
			() => {
				Weather.validateParamDate('2025-03-07T04:00');
			},
			(err) => {
				assert(err instanceof Error);
				assert.strictEqual(err.message, `Weather.validateParamDate: Invalid date '2025-03-07T04:00'.`);
				return true;
			}
		);
	};
	testData.desc = 'Static method Weather.validateParamDate()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #05 - Static method Weather.validateParamUnitGroup()...test#1
	testData = {};

	testData.method = async () => {

		// validate dynamic dates
		['us', 'uk', 'metric', 'base'].
			forEach(param => { assert.strictEqual(Weather.validateParamUnitGroup(param), param) });

		// invalid unitGroup parameter
		assert.throws(
			() => {
				Weather.validateParamUnitGroup(false);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.validateParamUnitGroup: Invalid unitGroup type 'boolean'.`);
				return true;
			}
		);

		assert.throws(
			() => {
				Weather.validateParamUnitGroup('TODAY');
			},
			(err) => {
				assert(err instanceof Error);
				assert.strictEqual(err.message, `Weather.validateParamUnitGroup: Invalid unitGroup value 'TODAY'.`);
				return true;
			}
		);
	};
	testData.desc = 'Static method Weather.validateParamUnitGroup()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #06 - Static method Weather.validateParamInclude()...test#1
	testData = {};

	testData.method = async () => {

		// validate include params
		let params = ['days', 'alerts', 'events'];
		assert.strictEqual(Weather.validateParamInclude(...params), params.join(','));

		// invalid include parameters
		assert.throws(
			() => {
				Weather.validateParamInclude('days', false);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.validateParamInclude: Invalid include parameter type 'boolean'.`);
				return true;
			}
		);

		assert.throws(
			() => {
				Weather.validateParamInclude('days', 'HOURS');
			},
			(err) => {
				assert(err instanceof Error);
				assert.strictEqual(err.message, `Weather.validateParamInclude: Invalid include parameter 'HOURS'.`);
				return true;
			}
		);
	};
	testData.desc = 'Static method Weather.validateParamInclude()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #07 - Static method Weather.validateParamElements()...test#1
	testData = {};

	testData.method = async () => {

		// validate elents params
		let params = ['temp', 'tempmin', 'tempmax'];
		assert.strictEqual(Weather.validateParamElements(...params), params.join(','));

		// invalid elements parameters
		assert.throws(
			() => {
				Weather.validateParamElements('temp', false);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.validateParamElements: Invalid elements parameter type 'boolean'.`);
				return true;
			}
		);

		assert.throws(
			() => {
				Weather.validateParamElements('temp', 'TEMP');
			},
			(err) => {
				assert(err instanceof Error);
				assert.strictEqual(err.message, `Weather.validateParamElements: Invalid elements parameter 'TEMP'.`);
				return true;
			}
		);
	};
	testData.desc = 'Static method Weather.validateParamElements()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #2 - Test Weather Instance Method fetchWeatherData
	suiteDesc = 'Test Weather Instance Method fetchWeatherData';
	suites.set(suiteDesc, []);

	// TEST #01 - Method fetchWeatherData()...test#1
	testData = {};

	testData.method = async () => {
		let weather = new Weather();

		try{
			await weather.fetchWeatherData('Alexandria', '2025-03-07');
			assert(false);
		}
		catch(error){
			assert.strictEqual(error.message, 'Weather.fetchWeatherData: No API key or session found.');
		}
	};
	testData.desc = 'Method fetchWeatherData()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method fetchWeatherData()...test#2
	testData = {};

	testData.method = async () => {
		let weather = new Weather(key);

		try{
			await weather.fetchWeatherData('', '2025-03-07');
			assert(false);
		}
		catch(error){
			assert.strictEqual(error.message, 'Weather.fetchWeatherData: Bad API Request:A location must be specified.');
		}
	};
	testData.desc = 'Method fetchWeatherData()...test#2';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #03 - Method fetchWeatherData()...test#3
	testData = {};

	testData.method = async () => {
		let weather = new Weather(key);

		try{
			await weather.fetchWeatherData('xxx', '2025-03-07');
			assert(false);
		}
		catch(error){
		}
	};
	testData.desc = 'Method fetchWeatherData()...test#3';

	testData.skip = !key; // skip test if no key
	suites.get(suiteDesc).push(testData);

	// TEST #04 - Method fetchWeatherData()...test#4
	testData = {};

	testData.method = async () => {
		let weather = new Weather(key);
		let fetch = globalThis.fetch;
		globalThis.fetch = null;

		try{
			await weather.fetchWeatherData('xxx', '2025-03-07');
			assert(false);
		}
		catch(error){
		}

		globalThis.fetch = fetch;
	};
	testData.desc = 'Method fetchWeatherData()...test#4';

	testData.skip = !key; // skip test if no key
	suites.get(suiteDesc).push(testData);

	// TEST #05 - Method fetchWeatherData()...test#5
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather(key);
		let actual = await weather.fetchWeatherData(sample.address, sample.days[0].datetime, undefined, undefined, 'days');

		[
			"latitude",
			"longitude",
			"resolvedAddress",
			"address",
			"timezone",
			"tzoffset",

		].forEach(key => {
			assert.strictEqual(actual[key], sample[key])
		});
	};
	testData.desc = 'Method fetchWeatherData()...test#5';

	testData.skip = !key; // skip test if no key
	suites.get(suiteDesc).push(testData);

	// TEST #06 - Method fetchWeatherData()...test#6
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);
		let fetch = globalThis.fetch;
		globalThis.fetch = null;

		let weather = new Weather(key);
		let actual = await weather.fetchWeatherData(sample.address, sample.days[0].datetime, undefined, undefined, 'days');

		[
			"latitude",
			"longitude",
			"resolvedAddress",
			"address",
			"timezone",
			"tzoffset",

		].forEach(key => {
			assert.strictEqual(actual[key], sample[key])
		});

		globalThis.fetch = fetch;
	};
	testData.desc = 'Method fetchWeatherData()...test#6';

	testData.skip = !key; // skip test if no key
	suites.get(suiteDesc).push(testData);

	// TEST #07 - Method fetchWeatherData()...test#7
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);
		let fetch = globalThis.fetch;
		globalThis.fetch = null;

		let weather = new Weather(key);
		let actual = await weather.fetchWeatherData(sample.address, undefined, undefined, undefined, 'days');

		[
			"latitude",
			"longitude",
			"resolvedAddress",
			"address",
			"timezone",
			"tzoffset",

		].forEach(key => {
			assert.strictEqual(actual[key], sample[key])
		});

		globalThis.fetch = fetch;
	};
	testData.desc = 'Method fetchWeatherData()...test#7';

	testData.skip = !key; // skip test if no key
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #3 - Test Weather Instance Methods - Data elements
	suiteDesc = 'Test Weather Instance Methods - Data elements';
	suites.set(suiteDesc, []);

	// TEST #01 - Method [get/set]WeatherData()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		assert.deepStrictEqual(weather.getWeatherData(), sample);

		let elements = ['address', 'days', 'latitude', 'longitude'];
		let res = weather.getWeatherData(elements);

		elements.forEach(e => { res[e] === sample[e] });

		assert(weather.getWeatherData('invalid arg') === null);
	};
	testData.desc = 'Method [get/set]WeatherData()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method [get/clear]WeatherData()...test#1
	testData = {};

	testData.method = async () => {

		let weather = new Weather();
		weather.clearWeatherData();

		assert.deepStrictEqual(weather.getWeatherData(), {});
	};
	testData.desc = 'Method [get/clear]WeatherData()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #03 - Method [get/set]WeatherDailyData()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		assert.deepStrictEqual(weather.getWeatherDailyData(), sample.days);

		let elements = ['tempmax', 'tempmin', 'temp'];
		let res = weather.getWeatherDailyData(elements);

		for(let i = 0; i < res.length; i++)
			for(let p in res[i])
				assert.strictEqual(res[i][p], sample.days[i][p]);

		assert(weather.getWeatherDailyData('invalid arg') === null);

		let arr = [];
		weather.setWeatherDailyData(arr);
		assert(weather.getWeatherDailyData() === arr);
	};
	testData.desc = 'Method [get/set]WeatherDailyData()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #04 - Method getWeatherHourlyData()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let res = weather.getWeatherHourlyData();

		for(let i = 0, j = 0; i < sample.days.length; i++)
			for(let k = 0; k < sample.days[i].hours.length; k++, j++)
				assert.deepStrictEqual(res[j], sample.days[i].hours[k]);

		res = weather.getWeatherHourlyData(['datetime']);

		for(let i = 0, j = 0; i < sample.days.length; i++)
			for(let k = 0; k < sample.days[i].hours.length; k++, j++)
				assert.strictEqual(res[j].datetime, sample.days[i].hours[k].datetime);

		assert(weather.getWeatherHourlyData('invalid arg') === null);
	};
	testData.desc = 'Method getWeatherHourlyData()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #05 - Method getDataOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let datetime = sample.days[0].datetime;

		assert.deepStrictEqual(weather.getDataOnDay(datetime), sample.days.find((data) => data.datetime === datetime));
		assert.deepStrictEqual(weather.getDataOnDay(0), sample.days[0]);
		assert(weather.getDataOnDay('1970-01-01') === undefined);

		let elements = ['tempmax', 'tempmin', 'temp'];
		let res = weather.getDataOnDay(0, elements);

		for(let p in res)
			assert.strictEqual(res[p], sample.days[0][p]);

		assert(weather.getDataOnDay(false) === null);
	};
	testData.desc = 'Method getDataOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #06 - Method [get/set]DataOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let datetime = sample.days[0].datetime;
		let data = {datetime: datetime};

		weather.setDataOnDay(datetime, data);
		assert(weather.getDataOnDay(datetime) === data);

		weather.setDataOnDay(0, data);
		assert(weather.getDataOnDay(0) === data);

		assert.throws(
			() => {
				weather.setDataOnDay(false, data);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setDataOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]DataOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #07 - Method getHourlyDataOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let datetime = sample.days[0].datetime;

		assert.deepStrictEqual(weather.getHourlyDataOnDay(datetime), sample.days.find((data) => data.datetime === datetime)?.hours);
		assert.deepStrictEqual(weather.getHourlyDataOnDay('1970-01-01'), []);

		assert.deepStrictEqual(weather.getHourlyDataOnDay(0), sample.days[0]?.hours);
		assert.deepStrictEqual(weather.getHourlyDataOnDay(50), []);

		let res = weather.getHourlyDataOnDay(datetime, ['datetime']);
		for(let i = 0; i < res.length; i++)
			assert.strictEqual(res[i].datetime, sample.days.find((data) => data.datetime === datetime)?.hours[i].datetime);

		assert.throws(
			() => {
				weather.getHourlyDataOnDay(false);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.getHourlyDataOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method getHourlyDataOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #08 - Method [get/set]HourlyDataOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let datetime, testObj;

		datetime = sample.days[0].datetime;
		testObj = {datetime: 'NA#1'};
		weather.setHourlyDataOnDay(datetime, testObj);

		assert.deepStrictEqual(weather.getHourlyDataOnDay(datetime), testObj);

		datetime = 0;
		testObj = {datetime: 'NA#2'};
		weather.setHourlyDataOnDay(datetime, testObj);

		assert.deepStrictEqual(weather.getHourlyDataOnDay(datetime), testObj);

		assert.throws(
			() => {
				weather.setHourlyDataOnDay(false, {});
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setHourlyDataOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]HourlyDataOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #09 - Method [get/set/update]DataAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let datetime = sample.days[0].datetime;
		let testObj = {data: 'test'};
		weather.setDataAtDatetime(datetime, '00:00:00', testObj);
		assert.strictEqual(weather.getDataAtDatetime(datetime, '00:00:00').data, testObj.data);

		testObj = {temp: 333};
		weather.updateDataAtDatetime(datetime, '00:00:00', testObj);
		assert.strictEqual(weather.getDataAtDatetime(datetime, '00:00:00').temp, testObj.temp);

		assert.deepStrictEqual(weather.getDataAtDatetime(datetime, '00:00:00', ['temp']), testObj);

		assert.throws(
			() => {
				weather.getDataAtDatetime(false, false);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);

		assert.throws(
			() => {
				weather.setDataAtDatetime(false, false, {});
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);

		assert.throws(
			() => {
				weather.updateDataAtDatetime(false, false, {});
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set/update]DataAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #10 - Method [get/set]DatetimeEpochAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let datetime = sample.days[0].datetime;
		let datetimeEpoch = 77;
		weather.setDatetimeEpochAtDatetime(datetime, '00:00:00', datetimeEpoch);

		assert.strictEqual(weather.getDatetimeEpochAtDatetime(datetime, '00:00:00'), datetimeEpoch);

		assert.throws(
			() => {
				weather.getDatetimeEpochAtDatetime(datetime, false);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);

		assert.throws(
			() => {
				weather.getDatetimeEpochAtDatetime(false, '00:00:00');
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);

		assert.throws(
			() => {
				weather.setDatetimeEpochAtDatetime(datetime, false, datetimeEpoch);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);

		assert.throws(
			() => {
				weather.setDatetimeEpochAtDatetime(false, '00:00:00', datetimeEpoch);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]DatetimeEpochAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #11 - Method getDailyDatetimes()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		assert.deepStrictEqual(weather.getDailyDatetimes(), sample.days.map(day => new Date(day.datetime)));
	};
	testData.desc = 'Method getDailyDatetimes()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #12 - Method getHourlyDatetimes()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let exp = sample.days.flatMap(day => day.hours.map(hour => new Date(`${day.datetime}T${hour.datetime}`)));
		assert.deepStrictEqual(weather.getHourlyDatetimes(), exp);
	};
	testData.desc = 'Method getHourlyDatetimes()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #4 - Test Weather Instance Methods - Location elements
	suiteDesc = 'Test Weather Instance Methods - Location elements';
	suites.set(suiteDesc, []);

	// TEST #01 - Method [get/set]Latitude()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testData = 0;
		weather.setLatitude(testData);
		assert.strictEqual(weather.getLatitude(), testData);

		assert.throws(
			() => {
				weather.setLatitude(-100);
			},
			(err) => {
				assert(err instanceof RangeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]Latitude()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method [get/set]Longitude()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testData = 0;
		weather.setLongitude(testData);
		assert.strictEqual(weather.getLongitude(), testData);

		assert.throws(
			() => {
				weather.setLongitude(-200);
			},
			(err) => {
				assert(err instanceof RangeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]Longitude()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #03 - Method [get/set]ResolvedAddress()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testData = 'Resolved Address';
		weather.setResolvedAddress(testData);
		assert.strictEqual(weather.getResolvedAddress(), testData);
	};
	testData.desc = 'Method [get/set]ResolvedAddress()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #04 - Method [get/set]Address()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testData = 'Address';
		weather.setAddress(testData);
		assert.strictEqual(weather.getAddress(), testData);
	};
	testData.desc = 'Method [get/set]Address()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #05 - Method [get/set]Timezone()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testData = 'Timezone';
		weather.setTimezone(testData);
		assert.strictEqual(weather.getTimezone(), testData);
	};
	testData.desc = 'Method [get/set]Timezone()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #06 - Method [get/set]Tzoffset()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testData = 0;
		weather.setTzoffset(testData);
		assert.strictEqual(weather.getTzoffset(), testData);
	};
	testData.desc = 'Method [get/set]Tzoffset()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #5 - Test Weather Instance Methods - Request elements
	suiteDesc = 'Test Weather Instance Methods - Request elements';
	suites.set(suiteDesc, []);

	// TEST #01 - Method [get/set]QueryCost()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testQueryCost;

		testQueryCost = 1;
		weather.setQueryCost(testQueryCost);
		assert.strictEqual(weather.getQueryCost(), testQueryCost);

		testQueryCost = 0;
		weather.setQueryCost(testQueryCost);
		assert.strictEqual(weather.getQueryCost(), null);
	};
	testData.desc = 'Method [get/set]QueryCost()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method [get/set]Stations()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testStations;

		testStations = ['TestStation'];
		weather.setStations(testStations);
		assert.deepStrictEqual(weather.getStations(), testStations);

		testStations = null;
		weather.setStations(testStations);
		assert.deepStrictEqual(weather.getStations(), []);
	};
	testData.desc = 'Method [get/set]Stations()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #6 - Test Weather Instance Methods - Core Weather elements on day
	suiteDesc = 'Test Weather Instance Methods - Core Weather elements on day';
	suites.set(suiteDesc, []);

	// TEST #01 - Method [get/set]TempOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTemp;

		testDay = sample.days[0].datetime;
		testTemp = 0;
		weather.setTempOnDay(testDay, testTemp);
		assert.strictEqual(weather.getTempOnDay(testDay), testTemp);

		testDay = 0;
		testTemp = 10;
		weather.setTempOnDay(testDay, testTemp);
		assert.strictEqual(weather.getTempOnDay(testDay), testTemp);

		assert.strictEqual(weather.getTempOnDay(), null);
		assert.strictEqual(weather.getTempOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setTempOnDay(false, testTemp);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setTempOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]TempOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method [get/set]TempmaxOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTemp;

		testDay = sample.days[0].datetime;
		testTemp = 0;
		weather.setTempmaxOnDay(testDay, testTemp);
		assert.strictEqual(weather.getTempmaxOnDay(testDay), testTemp);

		testDay = 0;
		testTemp = 10;
		weather.setTempmaxOnDay(testDay, testTemp);
		assert.strictEqual(weather.getTempmaxOnDay(testDay), testTemp);

		assert.strictEqual(weather.getTempmaxOnDay(), null);
		assert.strictEqual(weather.getTempmaxOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setTempmaxOnDay(false, testTemp);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setTempmaxOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]TempmaxOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #03 - Method [get/set]TempminOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTemp;

		testDay = sample.days[0].datetime;
		testTemp = 0;
		weather.setTempminOnDay(testDay, testTemp);
		assert.strictEqual(weather.getTempminOnDay(testDay), testTemp);

		testDay = 0;
		testTemp = 10;
		weather.setTempminOnDay(testDay, testTemp);
		assert.strictEqual(weather.getTempminOnDay(testDay), testTemp);

		assert.strictEqual(weather.getTempminOnDay(), null);
		assert.strictEqual(weather.getTempminOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setTempminOnDay(false, testTemp);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setTempminOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]TempminOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #04 - Method [get/set]FeelslikeOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testFeelslike;

		testDay = sample.days[0].datetime;
		testFeelslike = 0;
		weather.setFeelslikeOnDay(testDay, testFeelslike);
		assert.strictEqual(weather.getFeelslikeOnDay(testDay), testFeelslike);

		testDay = 0;
		testFeelslike = 10;
		weather.setFeelslikeOnDay(testDay, testFeelslike);
		assert.strictEqual(weather.getFeelslikeOnDay(testDay), testFeelslike);

		assert.strictEqual(weather.getFeelslikeOnDay(), null);
		assert.strictEqual(weather.getFeelslikeOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setFeelslikeOnDay(false, testFeelslike);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setFeelslikeOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]FeelslikeOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #05 - Method [get/set]FeelslikemaxOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testFeelslikemax;

		testDay = sample.days[0].datetime;
		testFeelslikemax = 0;
		weather.setFeelslikemaxOnDay(testDay, testFeelslikemax);
		assert.strictEqual(weather.getFeelslikemaxOnDay(testDay), testFeelslikemax);

		testDay = 0;
		testFeelslikemax = 10;
		weather.setFeelslikemaxOnDay(testDay, testFeelslikemax);
		assert.strictEqual(weather.getFeelslikemaxOnDay(testDay), testFeelslikemax);

		assert.strictEqual(weather.getFeelslikemaxOnDay(), null);
		assert.strictEqual(weather.getFeelslikemaxOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setFeelslikemaxOnDay(false, testFeelslikemax);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setFeelslikemaxOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]FeelslikemaxOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #06 - Method [get/set]FeelslikeminOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testFeelslikemin;

		testDay = sample.days[0].datetime;
		testFeelslikemin = 0;
		weather.setFeelslikeminOnDay(testDay, testFeelslikemin);
		assert.strictEqual(weather.getFeelslikeminOnDay(testDay), testFeelslikemin);

		testDay = 0;
		testFeelslikemin = 10;
		weather.setFeelslikeminOnDay(testDay, testFeelslikemin);
		assert.strictEqual(weather.getFeelslikeminOnDay(testDay), testFeelslikemin);

		assert.strictEqual(weather.getFeelslikeminOnDay(), null);
		assert.strictEqual(weather.getFeelslikeminOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setFeelslikeminOnDay(false, testFeelslikemin);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setFeelslikeminOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]FeelslikeminOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #07 - Method [get/set]DewOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testDew;

		testDay = sample.days[0].datetime;
		testDew = 0;
		weather.setDewOnDay(testDay, testDew);
		assert.strictEqual(weather.getDewOnDay(testDay), testDew);

		testDay = 0;
		testDew = 10;
		weather.setDewOnDay(testDay, testDew);
		assert.strictEqual(weather.getDewOnDay(testDay), testDew);

		assert.strictEqual(weather.getDewOnDay(), null);
		assert.strictEqual(weather.getDewOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setDewOnDay(false, testDew);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setDewOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]DewOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #08 - Method [get/set]HumidityOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testHumidity;

		testDay = sample.days[0].datetime;
		testHumidity = 0;
		weather.setHumidityOnDay(testDay, testHumidity);
		assert.strictEqual(weather.getHumidityOnDay(testDay), testHumidity);

		testDay = 0;
		testHumidity = 10;
		weather.setHumidityOnDay(testDay, testHumidity);
		assert.strictEqual(weather.getHumidityOnDay(testDay), testHumidity);

		assert.strictEqual(weather.getHumidityOnDay(), null);
		assert.strictEqual(weather.getHumidityOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setHumidityOnDay(false, testHumidity);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setHumidityOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]HumidityOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #09 - Method [get/set]PrecipOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testPrecip;

		testDay = sample.days[0].datetime;
		testPrecip = 0;
		weather.setPrecipOnDay(testDay, testPrecip);
		assert.strictEqual(weather.getPrecipOnDay(testDay), testPrecip);

		testDay = 0;
		testPrecip = 10;
		weather.setPrecipOnDay(testDay, testPrecip);
		assert.strictEqual(weather.getPrecipOnDay(testDay), testPrecip);

		assert.strictEqual(weather.getPrecipOnDay(), null);
		assert.strictEqual(weather.getPrecipOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setPrecipOnDay(false, testPrecip);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setPrecipOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PrecipOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #10 - Method [get/set]PrecipprobOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testPrecipprob;

		testDay = sample.days[0].datetime;
		testPrecipprob = 0;
		weather.setPrecipprobOnDay(testDay, testPrecipprob);
		assert.strictEqual(weather.getPrecipprobOnDay(testDay), testPrecipprob);

		testDay = 0;
		testPrecipprob = 10;
		weather.setPrecipprobOnDay(testDay, testPrecipprob);
		assert.strictEqual(weather.getPrecipprobOnDay(testDay), testPrecipprob);

		assert.strictEqual(weather.getPrecipprobOnDay(), null);
		assert.strictEqual(weather.getPrecipprobOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setPrecipprobOnDay(false, testPrecipprob);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setPrecipprobOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PrecipprobOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #11 - Method [get/set]PrecipcoverOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testPrecipcover;

		testDay = sample.days[0].datetime;
		testPrecipcover = 0;
		weather.setPrecipcoverOnDay(testDay, testPrecipcover);
		assert.strictEqual(weather.getPrecipcoverOnDay(testDay), testPrecipcover);

		testDay = 0;
		testPrecipcover = 10;
		weather.setPrecipcoverOnDay(testDay, testPrecipcover);
		assert.strictEqual(weather.getPrecipcoverOnDay(testDay), testPrecipcover);

		assert.strictEqual(weather.getPrecipcoverOnDay(), null);
		assert.strictEqual(weather.getPrecipcoverOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setPrecipcoverOnDay(false, testPrecipcover);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setPrecipcoverOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PrecipcoverOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #12 - Method [get/set]PreciptypeOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testPreciptype;

		testDay = sample.days[0].datetime;
		testPreciptype = 'type1';
		weather.setPreciptypeOnDay(testDay, testPreciptype);
		assert.strictEqual(weather.getPreciptypeOnDay(testDay), testPreciptype);

		testDay = 0;
		testPreciptype = 'type2';
		weather.setPreciptypeOnDay(testDay, testPreciptype);
		assert.strictEqual(weather.getPreciptypeOnDay(testDay), testPreciptype);

		assert.strictEqual(weather.getPreciptypeOnDay(), null);
		assert.strictEqual(weather.getPreciptypeOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setPreciptypeOnDay(false, testPreciptype);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setPreciptypeOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PreciptypeOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #13 - Method [get/set]SnowOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSnow;

		testDay = sample.days[0].datetime;
		testSnow = 0;
		weather.setSnowOnDay(testDay, testSnow);
		assert.strictEqual(weather.getSnowOnDay(testDay), testSnow);

		testDay = 0;
		testSnow = 10;
		weather.setSnowOnDay(testDay, testSnow);
		assert.strictEqual(weather.getSnowOnDay(testDay), testSnow);

		assert.strictEqual(weather.getSnowOnDay(), null);
		assert.strictEqual(weather.getSnowOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSnowOnDay(false, testSnow);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setSnowOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SnowOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #14 - Method [get/set]SnowdepthOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSnowdepth;

		testDay = sample.days[0].datetime;
		testSnowdepth = 0;
		weather.setSnowdepthOnDay(testDay, testSnowdepth);
		assert.strictEqual(weather.getSnowdepthOnDay(testDay), testSnowdepth);

		testDay = 0;
		testSnowdepth = 10;
		weather.setSnowdepthOnDay(testDay, testSnowdepth);
		assert.strictEqual(weather.getSnowdepthOnDay(testDay), testSnowdepth);

		assert.strictEqual(weather.getSnowdepthOnDay(), null);
		assert.strictEqual(weather.getSnowdepthOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSnowdepthOnDay(false, testSnowdepth);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setSnowdepthOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SnowdepthOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #15 - Method [get/set]WindgustOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testWindgust;

		testDay = sample.days[0].datetime;
		testWindgust = 0;
		weather.setWindgustOnDay(testDay, testWindgust);
		assert.strictEqual(weather.getWindgustOnDay(testDay), testWindgust);

		testDay = 0;
		testWindgust = 10;
		weather.setWindgustOnDay(testDay, testWindgust);
		assert.strictEqual(weather.getWindgustOnDay(testDay), testWindgust);

		assert.strictEqual(weather.getWindgustOnDay(), null);
		assert.strictEqual(weather.getWindgustOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setWindgustOnDay(false, testWindgust);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setWindgustOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]WindgustOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #16 - Method [get/set]WindspeedOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testWindspeed;

		testDay = sample.days[0].datetime;
		testWindspeed = 0;
		weather.setWindspeedOnDay(testDay, testWindspeed);
		assert.strictEqual(weather.getWindspeedOnDay(testDay), testWindspeed);

		testDay = 0;
		testWindspeed = 10;
		weather.setWindspeedOnDay(testDay, testWindspeed);
		assert.strictEqual(weather.getWindspeedOnDay(testDay), testWindspeed);

		assert.strictEqual(weather.getWindspeedOnDay(), null);
		assert.strictEqual(weather.getWindspeedOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setWindspeedOnDay(false, testWindspeed);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setWindspeedOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]WindspeedOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #17 - Method [get/set]WinddirOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testWinddir;

		testDay = sample.days[0].datetime;
		testWinddir = 0;
		weather.setWinddirOnDay(testDay, testWinddir);
		assert.strictEqual(weather.getWinddirOnDay(testDay), testWinddir);

		testDay = 0;
		testWinddir = 10;
		weather.setWinddirOnDay(testDay, testWinddir);
		assert.strictEqual(weather.getWinddirOnDay(testDay), testWinddir);

		assert.strictEqual(weather.getWinddirOnDay(), null);
		assert.strictEqual(weather.getWinddirOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setWinddirOnDay(false, testWinddir);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setWinddirOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]WinddirOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #18 - Method [get/set]PressureOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testPressure;

		testDay = sample.days[0].datetime;
		testPressure = 0;
		weather.setPressureOnDay(testDay, testPressure);
		assert.strictEqual(weather.getPressureOnDay(testDay), testPressure);

		testDay = 0;
		testPressure = 10;
		weather.setPressureOnDay(testDay, testPressure);
		assert.strictEqual(weather.getPressureOnDay(testDay), testPressure);

		assert.strictEqual(weather.getPressureOnDay(), null);
		assert.strictEqual(weather.getPressureOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setPressureOnDay(false, testPressure);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setPressureOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PressureOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #19 - Method [get/set]CloudcoverOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testCloudcover;

		testDay = sample.days[0].datetime;
		testCloudcover = 0;
		weather.setCloudcoverOnDay(testDay, testCloudcover);
		assert.strictEqual(weather.getCloudcoverOnDay(testDay), testCloudcover);

		testDay = 0;
		testCloudcover = 10;
		weather.setCloudcoverOnDay(testDay, testCloudcover);
		assert.strictEqual(weather.getCloudcoverOnDay(testDay), testCloudcover);

		assert.strictEqual(weather.getCloudcoverOnDay(), null);
		assert.strictEqual(weather.getCloudcoverOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setCloudcoverOnDay(false, testCloudcover);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setCloudcoverOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]CloudcoverOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #20 - Method [get/set]VisibilityOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testVisibility;

		testDay = sample.days[0].datetime;
		testVisibility = 0;
		weather.setVisibilityOnDay(testDay, testVisibility);
		assert.strictEqual(weather.getVisibilityOnDay(testDay), testVisibility);

		testDay = 0;
		testVisibility = 10;
		weather.setVisibilityOnDay(testDay, testVisibility);
		assert.strictEqual(weather.getVisibilityOnDay(testDay), testVisibility);

		assert.strictEqual(weather.getVisibilityOnDay(), null);
		assert.strictEqual(weather.getVisibilityOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setVisibilityOnDay(false, testVisibility);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setVisibilityOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]VisibilityOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #21 - Method [get/set]SolarradiationOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSolarradiation;

		testDay = sample.days[0].datetime;
		testSolarradiation = 0;
		weather.setSolarradiationOnDay(testDay, testSolarradiation);
		assert.strictEqual(weather.getSolarradiationOnDay(testDay), testSolarradiation);

		testDay = 0;
		testSolarradiation = 10;
		weather.setSolarradiationOnDay(testDay, testSolarradiation);
		assert.strictEqual(weather.getSolarradiationOnDay(testDay), testSolarradiation);

		assert.strictEqual(weather.getSolarradiationOnDay(), null);
		assert.strictEqual(weather.getSolarradiationOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSolarradiationOnDay(false, testSolarradiation);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setSolarradiationOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SolarradiationOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #22 - Method [get/set]SolarenergyOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSolarenergy;

		testDay = sample.days[0].datetime;
		testSolarenergy = 0;
		weather.setSolarenergyOnDay(testDay, testSolarenergy);
		assert.strictEqual(weather.getSolarenergyOnDay(testDay), testSolarenergy);

		testDay = 0;
		testSolarenergy = 10;
		weather.setSolarenergyOnDay(testDay, testSolarenergy);
		assert.strictEqual(weather.getSolarenergyOnDay(testDay), testSolarenergy);

		assert.strictEqual(weather.getSolarenergyOnDay(), null);
		assert.strictEqual(weather.getSolarenergyOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSolarenergyOnDay(false, testSolarenergy);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setSolarenergyOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SolarenergyOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #23 - Method [get/set]UvindexOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testUvindex;

		testDay = sample.days[0].datetime;
		testUvindex = 0;
		weather.setUvindexOnDay(testDay, testUvindex);
		assert.strictEqual(weather.getUvindexOnDay(testDay), testUvindex);

		testDay = 0;
		testUvindex = 10;
		weather.setUvindexOnDay(testDay, testUvindex);
		assert.strictEqual(weather.getUvindexOnDay(testDay), testUvindex);

		assert.strictEqual(weather.getUvindexOnDay(), null);
		assert.strictEqual(weather.getUvindexOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setUvindexOnDay(false, testUvindex);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setUvindexOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]UvindexOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #24 - Method [get/set]SevereriskOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSevererisk;

		testDay = sample.days[0].datetime;
		testSevererisk = 0;
		weather.setSevereriskOnDay(testDay, testSevererisk);
		assert.strictEqual(weather.getSevereriskOnDay(testDay), testSevererisk);

		testDay = 0;
		testSevererisk = 10;
		weather.setSevereriskOnDay(testDay, testSevererisk);
		assert.strictEqual(weather.getSevereriskOnDay(testDay), testSevererisk);

		assert.strictEqual(weather.getSevereriskOnDay(), null);
		assert.strictEqual(weather.getSevereriskOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSevereriskOnDay(false, testSevererisk);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setSevereriskOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SevereriskOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #25 - Method [get/set]StationsOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testStations;

		testDay = sample.days[0].datetime;
		testStations = ['stattion#1'];
		weather.setStationsOnDay(testDay, testStations);
		assert.deepStrictEqual(weather.getStationsOnDay(testDay), testStations);

		testDay = 0;
		testStations = ['stattion#2'];
		weather.setStationsOnDay(testDay, testStations);
		assert.deepStrictEqual(weather.getStationsOnDay(testDay), testStations);

		assert.strictEqual(weather.getStationsOnDay(), null);
		assert.strictEqual(weather.getStationsOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setStationsOnDay(false, testStations);
			},
			(err) => {
				assert(err instanceof TypeError);
				assert.strictEqual(err.message, `Weather.setStationsOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]StationsOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #7 - Test Weather Instance Methods - Astronomy elements
	suiteDesc = 'Test Weather Instance Methods - Astronomy elements';
	suites.set(suiteDesc, []);

	// TEST #01 - Method [get/set]SunriseOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSunrise;

		testDay = sample.days[0].datetime;
		testSunrise = '06:00:00';
		weather.setSunriseOnDay(testDay, testSunrise);
		assert.strictEqual(weather.getSunriseOnDay(testDay), testSunrise);

		testDay = 0;
		testSunrise = '06:30:00';
		weather.setSunriseOnDay(testDay, testSunrise);
		assert.strictEqual(weather.getSunriseOnDay(testDay), testSunrise);

		assert.strictEqual(weather.getSunriseOnDay(), null);
		assert.strictEqual(weather.getSunriseOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSunriseOnDay(false, testSunrise);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setSunriseOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SunriseOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method [get/set]SunriseEpochOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSunriseEpoch;

		testDay = sample.days[0].datetime;
		testSunriseEpoch = 1741327200000;
		weather.setSunriseEpochOnDay(testDay, testSunriseEpoch);
		assert.strictEqual(weather.getSunriseEpochOnDay(testDay), testSunriseEpoch);

		testDay = 0;
		testSunriseEpoch = 1741329000000;
		weather.setSunriseEpochOnDay(testDay, testSunriseEpoch);
		assert.strictEqual(weather.getSunriseEpochOnDay(testDay), testSunriseEpoch);

		assert.strictEqual(weather.getSunriseEpochOnDay(), null);
		assert.strictEqual(weather.getSunriseEpochOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSunriseEpochOnDay(false, testSunriseEpoch);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setSunriseEpochOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SunriseEpochOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #03 - Method [get/set]SunsetOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSunset;

		testDay = sample.days[0].datetime;
		testSunset = '06:00:00';
		weather.setSunsetOnDay(testDay, testSunset);
		assert.strictEqual(weather.getSunsetOnDay(testDay), testSunset);

		testDay = 0;
		testSunset = '06:30:00';
		weather.setSunsetOnDay(testDay, testSunset);
		assert.strictEqual(weather.getSunsetOnDay(testDay), testSunset);

		assert.strictEqual(weather.getSunsetOnDay(), null);
		assert.strictEqual(weather.getSunsetOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSunsetOnDay(false, testSunset);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setSunsetOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SunsetOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #04 - Method [get/set]SunsetEpochOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testSunsetEpoch;

		testDay = sample.days[0].datetime;
		testSunsetEpoch = sample.days[0].sunsetEpoch;
		weather.setSunsetEpochOnDay(testDay, testSunsetEpoch);
		assert.strictEqual(weather.getSunsetEpochOnDay(testDay), testSunsetEpoch);

		testDay = 0;
		testSunsetEpoch = sample.days[0].sunsetEpoch;
		weather.setSunsetEpochOnDay(testDay, testSunsetEpoch);
		assert.strictEqual(weather.getSunsetEpochOnDay(testDay), testSunsetEpoch);

		assert.strictEqual(weather.getSunsetEpochOnDay(), null);
		assert.strictEqual(weather.getSunsetEpochOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setSunsetEpochOnDay(false, testSunsetEpoch);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setSunsetEpochOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SunsetEpochOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #05 - Method [get/set]MoonphaseOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testMoonphase;

		testDay = sample.days[0].datetime;
		testMoonphase = 0;
		weather.setMoonphaseOnDay(testDay, testMoonphase);
		assert.strictEqual(weather.getMoonphaseOnDay(testDay), testMoonphase);

		testDay = 0;
		testMoonphase = 0.25;
		weather.setMoonphaseOnDay(testDay, testMoonphase);
		assert.strictEqual(weather.getMoonphaseOnDay(testDay), testMoonphase);

		assert.strictEqual(weather.getMoonphaseOnDay(), null);
		assert.strictEqual(weather.getMoonphaseOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setMoonphaseOnDay(false, testMoonphase);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setMoonphaseOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]MoonphaseOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #8 - Test Weather Instance Methods - Description elements
	suiteDesc = 'Test Weather Instance Methods - Description elements';
	suites.set(suiteDesc, []);

	// TEST #01 - Method [get/set]ConditionsOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testConditions;

		testDay = sample.days[0].datetime;
		testConditions = 'conditions#1';
		weather.setConditionsOnDay(testDay, testConditions);
		assert.strictEqual(weather.getConditionsOnDay(testDay), testConditions);

		testDay = 0;
		testConditions = 'conditions#2';
		weather.setConditionsOnDay(testDay, testConditions);
		assert.strictEqual(weather.getConditionsOnDay(testDay), testConditions);

		assert.strictEqual(weather.getConditionsOnDay(), null);
		assert.strictEqual(weather.getConditionsOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setConditionsOnDay(false, testConditions);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setConditionsOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]ConditionsOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method [get/set]DescriptionOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testDescription;

		testDay = sample.days[0].datetime;
		testDescription = 'description#1';
		weather.setDescriptionOnDay(testDay, testDescription);
		assert.strictEqual(weather.getDescriptionOnDay(testDay), testDescription);

		testDay = 0;
		testDescription = 'description#2';
		weather.setDescriptionOnDay(testDay, testDescription);
		assert.strictEqual(weather.getDescriptionOnDay(testDay), testDescription);

		assert.strictEqual(weather.getDescriptionOnDay(), null);
		assert.strictEqual(weather.getDescriptionOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setDescriptionOnDay(false, testDescription);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setDescriptionOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]DescriptionOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #03 - Method [get/set]IconOnDay()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testIcon;

		testDay = sample.days[0].datetime;
		testIcon = 'icon#1';
		weather.setIconOnDay(testDay, testIcon);
		assert.strictEqual(weather.getIconOnDay(testDay), testIcon);

		testDay = 0;
		testIcon = 'icon#2';
		weather.setIconOnDay(testDay, testIcon);
		assert.strictEqual(weather.getIconOnDay(testDay), testIcon);

		assert.strictEqual(weather.getIconOnDay(), null);
		assert.strictEqual(weather.getIconOnDay('1970-01-01'), null);
		assert.throws(
			() => {
				weather.setIconOnDay(false, testIcon);
			},
			(err) => {
				assert(err instanceof TypeError);
                assert.strictEqual(err.message, `Weather.setIconOnDay: Invalid input day value 'false'.`);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]IconOnDay()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #9 - Test Weather Instance Methods - Core Weather elements at datetime
	suiteDesc = 'Test Weather Instance Methods - Core Weather elements at datetime';
	suites.set(suiteDesc, []);

	// TEST #01 - Method [get/set]TempAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testTemp;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testTemp = 0;
		weather.setTempAtDatetime(testDay, testTime, testTemp);
		assert.strictEqual(weather.getTempAtDatetime(testDay, testTime), testTemp);

		testDay = 0;
		testTime = 0;
		testTemp = 10;
		weather.setTempAtDatetime(testDay, testTime, testTemp);
		assert.strictEqual(weather.getTempAtDatetime(testDay, testTime), testTemp);

		assert.strictEqual(weather.getTempAtDatetime('2025-03-07', '24:00:00'), null);
		assert.strictEqual(weather.getTempAtDatetime('1970-01-01', '00:00:00'), null);
		assert.strictEqual(weather.getTempAtDatetime(0, false), null);
		assert.strictEqual(weather.getTempAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setTempAtDatetime(0, false, testTemp);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setTempAtDatetime(false, false, testTemp);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]TempAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method [get/set]FeelsLikeAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testFeelsLike;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testFeelsLike = 0;
		weather.setFeelsLikeAtDatetime(testDay, testTime, testFeelsLike);
		assert.strictEqual(weather.getFeelsLikeAtDatetime(testDay, testTime), testFeelsLike);

		testDay = 0;
		testTime = 0;
		testFeelsLike = 10;
		weather.setFeelsLikeAtDatetime(testDay, testTime, testFeelsLike);
		assert.strictEqual(weather.getFeelsLikeAtDatetime(testDay, testTime), testFeelsLike);

		assert.strictEqual(weather.getFeelsLikeAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getFeelsLikeAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getFeelsLikeAtDatetime(0, false), null);
		assert.strictEqual(weather.getFeelsLikeAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setFeelsLikeAtDatetime(0, false, testFeelsLike);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setFeelsLikeAtDatetime(false, false, testFeelsLike);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]FeelsLikeAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #03 - Method [get/set]DewAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testDew;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testDew = 0;
		weather.setDewAtDatetime(testDay, testTime, testDew);
		assert.strictEqual(weather.getDewAtDatetime(testDay, testTime), testDew);

		testDay = 0;
		testTime = 0;
		testDew = 10;
		weather.setDewAtDatetime(testDay, testTime, testDew);
		assert.strictEqual(weather.getDewAtDatetime(testDay, testTime), testDew);

		assert.strictEqual(weather.getDewAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getDewAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getDewAtDatetime(0, false), null);
		assert.strictEqual(weather.getDewAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setDewAtDatetime(0, false, testDew);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setDewAtDatetime(false, false, testDew);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]DewAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #04 - Method [get/set]HumidityAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testHumidity;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testHumidity = 0;
		weather.setHumidityAtDatetime(testDay, testTime, testHumidity);
		assert.strictEqual(weather.getHumidityAtDatetime(testDay, testTime), testHumidity);

		testDay = 0;
		testTime = 0;
		testHumidity = 10;
		weather.setHumidityAtDatetime(testDay, testTime, testHumidity);
		assert.strictEqual(weather.getHumidityAtDatetime(testDay, testTime), testHumidity);

		assert.strictEqual(weather.getHumidityAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getHumidityAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getHumidityAtDatetime(0, false), null);
		assert.strictEqual(weather.getHumidityAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setHumidityAtDatetime(0, false, testHumidity);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setHumidityAtDatetime(false, false, testHumidity);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]HumidityAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #05 - Method [get/set]PrecipAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testPrecip;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testPrecip = 0;
		weather.setPrecipAtDatetime(testDay, testTime, testPrecip);
		assert.strictEqual(weather.getPrecipAtDatetime(testDay, testTime), testPrecip);

		testDay = 0;
		testTime = 0;
		testPrecip = 10;
		weather.setPrecipAtDatetime(testDay, testTime, testPrecip);
		assert.strictEqual(weather.getPrecipAtDatetime(testDay, testTime), testPrecip);

		assert.strictEqual(weather.getPrecipAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getPrecipAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getPrecipAtDatetime(0, false), null);
		assert.strictEqual(weather.getPrecipAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setPrecipAtDatetime(0, false, testPrecip);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setPrecipAtDatetime(false, false, testPrecip);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PrecipAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #06 - Method [get/set]PrecipProbAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testPrecipProb;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testPrecipProb = 0;
		weather.setPrecipProbAtDatetime(testDay, testTime, testPrecipProb);
		assert.strictEqual(weather.getPrecipProbAtDatetime(testDay, testTime), testPrecipProb);

		testDay = 0;
		testTime = 0;
		testPrecipProb = 10;
		weather.setPrecipProbAtDatetime(testDay, testTime, testPrecipProb);
		assert.strictEqual(weather.getPrecipProbAtDatetime(testDay, testTime), testPrecipProb);

		assert.strictEqual(weather.getPrecipProbAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getPrecipProbAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getPrecipProbAtDatetime(0, false), null);
		assert.strictEqual(weather.getPrecipProbAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setPrecipProbAtDatetime(0, false, testPrecipProb);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setPrecipProbAtDatetime(false, false, testPrecipProb);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PrecipProbAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #07 - Method [get/set]PreciptypeAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testPreciptype;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testPreciptype = 'type#1';
		weather.setPreciptypeAtDatetime(testDay, testTime, testPreciptype);
		assert.strictEqual(weather.getPreciptypeAtDatetime(testDay, testTime), testPreciptype);

		testDay = 0;
		testTime = 0;
		testPreciptype = 'type#2';
		weather.setPreciptypeAtDatetime(testDay, testTime, testPreciptype);
		assert.strictEqual(weather.getPreciptypeAtDatetime(testDay, testTime), testPreciptype);

		assert.strictEqual(weather.getPreciptypeAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getPreciptypeAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getPreciptypeAtDatetime(0, false), null);
		assert.strictEqual(weather.getPreciptypeAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setPreciptypeAtDatetime(0, false, testPreciptype);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setPreciptypeAtDatetime(false, false, testPreciptype);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PreciptypeAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #08 - Method [get/set]SnowAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testSnow;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testSnow = 0;
		weather.setSnowAtDatetime(testDay, testTime, testSnow);
		assert.strictEqual(weather.getSnowAtDatetime(testDay, testTime), testSnow);

		testDay = 0;
		testTime = 0;
		testSnow = 10;
		weather.setSnowAtDatetime(testDay, testTime, testSnow);
		assert.strictEqual(weather.getSnowAtDatetime(testDay, testTime), testSnow);

		assert.strictEqual(weather.getSnowAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getSnowAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getSnowAtDatetime(0, false), null);
		assert.strictEqual(weather.getSnowAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setSnowAtDatetime(0, false, testSnow);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setSnowAtDatetime(false, false, testSnow);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SnowAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #09 - Method [get/set]SnowDepthAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testSnowDepth;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testSnowDepth = 0;
		weather.setSnowDepthAtDatetime(testDay, testTime, testSnowDepth);
		assert.strictEqual(weather.getSnowDepthAtDatetime(testDay, testTime), testSnowDepth);

		testDay = 0;
		testTime = 0;
		testSnowDepth = 10;
		weather.setSnowDepthAtDatetime(testDay, testTime, testSnowDepth);
		assert.strictEqual(weather.getSnowDepthAtDatetime(testDay, testTime), testSnowDepth);

		assert.strictEqual(weather.getSnowDepthAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getSnowDepthAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getSnowDepthAtDatetime(0, false), null);
		assert.strictEqual(weather.getSnowDepthAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setSnowDepthAtDatetime(0, false, testSnowDepth);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setSnowDepthAtDatetime(false, false, testSnowDepth);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SnowDepthAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #10 - Method [get/set]WindgustAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testWindgust;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testWindgust = 0;
		weather.setWindgustAtDatetime(testDay, testTime, testWindgust);
		assert.strictEqual(weather.getWindgustAtDatetime(testDay, testTime), testWindgust);

		testDay = 0;
		testTime = 0;
		testWindgust = 10;
		weather.setWindgustAtDatetime(testDay, testTime, testWindgust);
		assert.strictEqual(weather.getWindgustAtDatetime(testDay, testTime), testWindgust);

		assert.strictEqual(weather.getWindgustAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getWindgustAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getWindgustAtDatetime(0, false), null);
		assert.strictEqual(weather.getWindgustAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setWindgustAtDatetime(0, false, testWindgust);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setWindgustAtDatetime(false, false, testWindgust);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]WindgustAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #11 - Method [get/set]WindspeedAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testWindspeed;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testWindspeed = 0;
		weather.setWindspeedAtDatetime(testDay, testTime, testWindspeed);
		assert.strictEqual(weather.getWindspeedAtDatetime(testDay, testTime), testWindspeed);

		testDay = 0;
		testTime = 0;
		testWindspeed = 10;
		weather.setWindspeedAtDatetime(testDay, testTime, testWindspeed);
		assert.strictEqual(weather.getWindspeedAtDatetime(testDay, testTime), testWindspeed);

		assert.strictEqual(weather.getWindspeedAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getWindspeedAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getWindspeedAtDatetime(0, false), null);
		assert.strictEqual(weather.getWindspeedAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setWindspeedAtDatetime(0, false, testWindspeed);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setWindspeedAtDatetime(false, false, testWindspeed);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]WindspeedAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #12 - Method [get/set]WinddirAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testWinddir;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testWinddir = 0;
		weather.setWinddirAtDatetime(testDay, testTime, testWinddir);
		assert.strictEqual(weather.getWinddirAtDatetime(testDay, testTime), testWinddir);

		testDay = 0;
		testTime = 0;
		testWinddir = 10;
		weather.setWinddirAtDatetime(testDay, testTime, testWinddir);
		assert.strictEqual(weather.getWinddirAtDatetime(testDay, testTime), testWinddir);

		assert.strictEqual(weather.getWinddirAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getWinddirAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getWinddirAtDatetime(0, false), null);
		assert.strictEqual(weather.getWinddirAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setWinddirAtDatetime(0, false, testWinddir);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setWinddirAtDatetime(false, false, testWinddir);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]WinddirAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #13 - Method [get/set]PressureAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testPressure;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testPressure = 0;
		weather.setPressureAtDatetime(testDay, testTime, testPressure);
		assert.strictEqual(weather.getPressureAtDatetime(testDay, testTime), testPressure);

		testDay = 0;
		testTime = 0;
		testPressure = 10;
		weather.setPressureAtDatetime(testDay, testTime, testPressure);
		assert.strictEqual(weather.getPressureAtDatetime(testDay, testTime), testPressure);

		assert.strictEqual(weather.getPressureAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getPressureAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getPressureAtDatetime(0, false), null);
		assert.strictEqual(weather.getPressureAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setPressureAtDatetime(0, false, testPressure);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setPressureAtDatetime(false, false, testPressure);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]PressureAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #14 - Method [get/set]CloudcoverAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testCloudcover;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testCloudcover = 0;
		weather.setCloudcoverAtDatetime(testDay, testTime, testCloudcover);
		assert.strictEqual(weather.getCloudcoverAtDatetime(testDay, testTime), testCloudcover);

		testDay = 0;
		testTime = 0;
		testCloudcover = 10;
		weather.setCloudcoverAtDatetime(testDay, testTime, testCloudcover);
		assert.strictEqual(weather.getCloudcoverAtDatetime(testDay, testTime), testCloudcover);

		assert.strictEqual(weather.getCloudcoverAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getCloudcoverAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getCloudcoverAtDatetime(0, false), null);
		assert.strictEqual(weather.getCloudcoverAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setCloudcoverAtDatetime(0, false, testCloudcover);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setCloudcoverAtDatetime(false, false, testCloudcover);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]CloudcoverAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #15 - Method [get/set]VisibilityAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testVisibility;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testVisibility = 0;
		weather.setVisibilityAtDatetime(testDay, testTime, testVisibility);
		assert.strictEqual(weather.getVisibilityAtDatetime(testDay, testTime), testVisibility);

		testDay = 0;
		testTime = 0;
		testVisibility = 10;
		weather.setVisibilityAtDatetime(testDay, testTime, testVisibility);
		assert.strictEqual(weather.getVisibilityAtDatetime(testDay, testTime), testVisibility);

		assert.strictEqual(weather.getVisibilityAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getVisibilityAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getVisibilityAtDatetime(0, false), null);
		assert.strictEqual(weather.getVisibilityAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setVisibilityAtDatetime(0, false, testVisibility);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setVisibilityAtDatetime(false, false, testVisibility);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]VisibilityAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #16 - Method [get/set]SolarradiationAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testSolarradiation;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testSolarradiation = 0;
		weather.setSolarradiationAtDatetime(testDay, testTime, testSolarradiation);
		assert.strictEqual(weather.getSolarradiationAtDatetime(testDay, testTime), testSolarradiation);

		testDay = 0;
		testTime = 0;
		testSolarradiation = 10;
		weather.setSolarradiationAtDatetime(testDay, testTime, testSolarradiation);
		assert.strictEqual(weather.getSolarradiationAtDatetime(testDay, testTime), testSolarradiation);

		assert.strictEqual(weather.getSolarradiationAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getSolarradiationAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getSolarradiationAtDatetime(0, false), null);
		assert.strictEqual(weather.getSolarradiationAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setSolarradiationAtDatetime(0, false, testSolarradiation);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setSolarradiationAtDatetime(false, false, testSolarradiation);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SolarradiationAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #17 - Method [get/set]SolarenergyAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testSolarenergy;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testSolarenergy = 0;
		weather.setSolarenergyAtDatetime(testDay, testTime, testSolarenergy);
		assert.strictEqual(weather.getSolarenergyAtDatetime(testDay, testTime), testSolarenergy);

		testDay = 0;
		testTime = 0;
		testSolarenergy = 10;
		weather.setSolarenergyAtDatetime(testDay, testTime, testSolarenergy);
		assert.strictEqual(weather.getSolarenergyAtDatetime(testDay, testTime), testSolarenergy);

		assert.strictEqual(weather.getSolarenergyAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getSolarenergyAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getSolarenergyAtDatetime(0, false), null);
		assert.strictEqual(weather.getSolarenergyAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setSolarenergyAtDatetime(0, false, testSolarenergy);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setSolarenergyAtDatetime(false, false, testSolarenergy);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SolarenergyAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #18 - Method [get/set]UvindexAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testUvindex;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testUvindex = 0;
		weather.setUvindexAtDatetime(testDay, testTime, testUvindex);
		assert.strictEqual(weather.getUvindexAtDatetime(testDay, testTime), testUvindex);

		testDay = 0;
		testTime = 0;
		testUvindex = 10;
		weather.setUvindexAtDatetime(testDay, testTime, testUvindex);
		assert.strictEqual(weather.getUvindexAtDatetime(testDay, testTime), testUvindex);

		assert.strictEqual(weather.getUvindexAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getUvindexAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getUvindexAtDatetime(0, false), null);
		assert.strictEqual(weather.getUvindexAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setUvindexAtDatetime(0, false, testUvindex);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setUvindexAtDatetime(false, false, testUvindex);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]UvindexAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #19 - Method [get/set]SevereriskAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testSevererisk;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testSevererisk = 0;
		weather.setSevereriskAtDatetime(testDay, testTime, testSevererisk);
		assert.strictEqual(weather.getSevereriskAtDatetime(testDay, testTime), testSevererisk);

		testDay = 0;
		testTime = 0;
		testSevererisk = 10;
		weather.setSevereriskAtDatetime(testDay, testTime, testSevererisk);
		assert.strictEqual(weather.getSevereriskAtDatetime(testDay, testTime), testSevererisk);

		assert.strictEqual(weather.getSevereriskAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getSevereriskAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getSevereriskAtDatetime(0, false), null);
		assert.strictEqual(weather.getSevereriskAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setSevereriskAtDatetime(0, false, testSevererisk);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setSevereriskAtDatetime(false, false, testSevererisk);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SevereriskAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #20 - Method [get/set]StationsAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testStations;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testStations = ['station#1'];
		weather.setStationsAtDatetime(testDay, testTime, testStations);
		assert.strictEqual(weather.getStationsAtDatetime(testDay, testTime), testStations);

		testDay = 0;
		testTime = 0;
		testStations = ['station#2'];
		weather.setStationsAtDatetime(testDay, testTime, testStations);
		assert.strictEqual(weather.getStationsAtDatetime(testDay, testTime), testStations);

		assert.strictEqual(weather.getStationsAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getStationsAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getStationsAtDatetime(0, false), null);
		assert.strictEqual(weather.getStationsAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setStationsAtDatetime(0, false, testStations);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setStationsAtDatetime(false, false, testStations);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]StationsAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #21 - Method [get/set]SourceAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testSource;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testSource = 'source#1';
		weather.setSourceAtDatetime(testDay, testTime, testSource);
		assert.strictEqual(weather.getSourceAtDatetime(testDay, testTime), testSource);

		testDay = 0;
		testTime = 0;
		testSource = 'source#2';
		weather.setSourceAtDatetime(testDay, testTime, testSource);
		assert.strictEqual(weather.getSourceAtDatetime(testDay, testTime), testSource);

		assert.strictEqual(weather.getSourceAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getSourceAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getSourceAtDatetime(0, false), null);
		assert.strictEqual(weather.getSourceAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setSourceAtDatetime(0, false, testSource);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setSourceAtDatetime(false, false, testSource);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]SourceAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST SUITE #10 - Test Weather Instance Methods - Description elements at datetime
	suiteDesc = 'Test Weather Instance Methods - Description elements at datetime';
	suites.set(suiteDesc, []);

	// TEST #01 - Method [get/set]ConditionsAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testConditions;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testConditions = 'cond#1';
		weather.setConditionsAtDatetime(testDay, testTime, testConditions);
		assert.strictEqual(weather.getConditionsAtDatetime(testDay, testTime), testConditions);

		testDay = 0;
		testTime = 0;
		testConditions = 'cond#2';
		weather.setConditionsAtDatetime(testDay, testTime, testConditions);
		assert.strictEqual(weather.getConditionsAtDatetime(testDay, testTime), testConditions);

		assert.strictEqual(weather.getConditionsAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getConditionsAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getConditionsAtDatetime(0, false), null);
		assert.strictEqual(weather.getConditionsAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setConditionsAtDatetime(0, false, testConditions);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setConditionsAtDatetime(false, false, testConditions);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]ConditionsAtDatetime()...test#1';

	testData.skip = false;
	suites.get(suiteDesc).push(testData);

	// TEST #02 - Method [get/set]IconAtDatetime()...test#1
	testData = {};

	testData.method = async () => {
		let sample = JSON.parse(sampleActive);

		let weather = new Weather();
		weather.setWeatherData(sample);

		let testDay, testTime, testIcon;

		testDay = sample.days[0].datetime;
		testTime = sample.days[0].hours[0].datetime;
		testIcon = 'icon#1';
		weather.setIconAtDatetime(testDay, testTime, testIcon);
		assert.strictEqual(weather.getIconAtDatetime(testDay, testTime), testIcon);

		testDay = 0;
		testTime = 0;
		testIcon = 'icon#2';
		weather.setIconAtDatetime(testDay, testTime, testIcon);
		assert.strictEqual(weather.getIconAtDatetime(testDay, testTime), testIcon);

		assert.strictEqual(weather.getIconAtDatetime(0, '24:00:00'), null);
		assert.strictEqual(weather.getIconAtDatetime('1970-01-01', 0), null);
		assert.strictEqual(weather.getIconAtDatetime(0, false), null);
		assert.strictEqual(weather.getIconAtDatetime(false, false), null);

		assert.throws(
			() => {
				weather.setIconAtDatetime(0, false, testIcon);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
		assert.throws(
			() => {
				weather.setIconAtDatetime(false, false, testIcon);
			},
			(err) => {
				assert(err instanceof TypeError);
				return true;
			}
		);
	};
	testData.desc = 'Method [get/set]IconAtDatetime()...test#1';

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
 * @async
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
