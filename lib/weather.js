/**
 * @module  weather
 * @desc    A module that defines a Weather class to fetch and manipulate weather data using the Visual Crossing Weather API.
 * @version 1.0.0
 * @author  Essam A. El-Sherif
 */

/* Import node.js core modules */
import https from 'node:https';

/* Import local dependencies */
import { extractSubobjectByKeys, updateObject, isValidObject } from './utils.js';

/**
 * @const {string} BASE_URL - Base URL for creating a weather API request.
 * @see   [Visual Crossing Timeline Weather API]{@link https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/#request-base-url}.
 */
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

/**
 * @class  Weather
 * @static
 * @desc   A class to fetch and manipulate weather data using the Visual Crossing Weather API.
 */
export class Weather{

	/**
	 * @member   weatherData
	 * @instance
	 * @memberof module:weather.Weather
	 * @private
	 * @desc     Private member to hold the weather data object.
	 */
	#weatherData;

	/**
	 * @method   constructor
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string} apiKey - API key for the weather API.
	 * @param    {string} baseUrl - Base URL of the weather API.
	 * @desc     Constructs a new Weather object.
	 */
	constructor(apiKey = '', baseUrl = BASE_URL){
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.#weatherData = {};

		/* Hide the apiKey property */
		Object.defineProperty(this, 'apiKey', {enumerable: false});
	}

	/**
	 * @method   filterItemByDatetimeVal
	 * @static
	 * @memberof module:weather.Weather
	 * @param    {Array} src - The source list of dictionaries, each expected to contain a 'datetime' key.
	 * @param    {string|number} datetimeVal - The datetime value used for filtering, which can be a date string or an index.
	 * @returns  {Object|null} The filtered dictionary item, or null if not available.
	 * @desc     Filters an item by its datetime value from a list of dictionaries, each containing a 'datetime' key.
	 * @throws   {TypeError} If the datetimeVal is neither a string nor a number.
	 */
	static filterItemByDatetimeVal(src, datetimeVal){

		if(typeof datetimeVal === 'string'){
			return src.find(item => item.datetime === datetimeVal) || null;
		}
		else
		if(typeof datetimeVal === 'number'){
			return src[datetimeVal] || null;
		}
		else{
			throw new TypeError(`Weather.filterItemByDatetimeVal: Invalid input datetime value '${datetimeVal}'.`);
		}
	}

	/**
	 * @method   setItemByDatetimeVal
	 * @static
	 * @memberof module:weather.Weather
	 * @param    {Array} src - The source list of dictionaries, each expected to contain a 'datetime' key.
	 * @param    {string|number} datetimeVal - The datetime value used for updating, which can be a date string or an index.
	 * @param    {Object} data - The new data dictionary to replace the old dictionary.
	 * @desc     Sets an item's data by its datetime value in a list of dictionaries based on the given datetimeVal.
	 * @throws   {TypeError} If the input data is not an object or datetimeVal is neither a string nor a number.
	 */
	static setItemByDatetimeVal(src, datetimeVal, data){

		if(typeof data !== 'object' || data === null){
			throw new TypeError(`Weather.setItemByDatetimeVal: Invalid input data value '${data}'.`);
		}

		if(typeof datetimeVal === 'string'){
			for(const item of src){
				if(item.datetime === datetimeVal){
					Object.assign(item, data, { datetime: datetimeVal });
					break;
				}
			}
		}
		else
		if(typeof datetimeVal === 'number'){
			if(src[datetimeVal]){
				data.datetime = src[datetimeVal].datetime;
				src[datetimeVal] = { ...data };
			}
		}
		else{
			throw new TypeError(`Weather.setItemByDatetimeVal: Invalid input datetime value '${datetimeVal}'.`);
		}
	}

	/**
	 * @method   updateItemByDatetimeVal
	 * @static
	 * @memberof module:weather.Weather
	 * @param    {Array} src - The source list of dictionaries, each expected to contain a 'datetime' key.
	 * @param    {string|number} datetimeVal - The datetime value used for updating, which can be a date string or an index.
	 * @param    {Object} data - The new data dictionary to update the old dictionary.
	 * @desc     Updates an item's data by its datetime value in a list of dictionaries based on the given datetimeVal.
	 * @throws   {TypeError} If the input data is not an object or datetimeVal is neither a string nor a number.
	 */
	static updateItemByDatetimeVal(src, datetimeVal, data){

		if(typeof data !== 'object' || data === null){
			throw new TypeError(`Weather.updateItemByDatetimeVal: Invalid input data value '${data}'.`);
		}

		if(typeof datetimeVal === 'string'){
			for(const item of src){
				if(item.datetime === datetimeVal){
					Object.assign(item, data);
					item.datetime = datetimeVal;
					break;
				}
			}
		}
		else
		if(typeof datetimeVal === 'number'){
			if(src[datetimeVal]){
				data.datetime = src[datetimeVal].datetime;
				Object.assign(src[datetimeVal], data);
			}
		}
		else{
			throw new TypeError(`Weather.updateItemByDatetimeVal: Invalid input datetime value '${datetimeVal}'.`);
		}
	}

	/**
	 * @method   validateParamDate
	 * @static
	 * @memberof module:weather.Weather
	 * @param    {string|number} param - The date for which to retrieve weather data.
	 * @returns  {string|number} The validated date for which to retrieve weather data.
	 * @desc     Validate and return the date for which to retrieve weather data.
	 * @throws   {TypeError|Error} If the input data type is neither a string nor a number or its format is invalid.
	 */
	static validateParamDate(param){
		if(typeof param === 'string'){
			// using dynamaic dates to replace date1 and date2 parameters
			if(
				[
					'today',       // from midnight today to midnight tomorrow at the requested location.
					'tomorrow',    // from midnight tomorrow to midnight the day after at the requested location.
					'yesterday',   // from midnight to midnight on yesterday’s date.
					'yeartodate',  // from midnight of January 1st of the current year until the current date time.
					'monthtodate', // from midnight on the 1st of the current month until the current date time.
					'lastyear',    // the one year period ending on yesterday’s date.
					'last24hours', // the 24 hour period ending at the current time (rounded to the currenthour).
					'nextweekend', // the next occurrence of the weekend after today’s day. Weekend is defined as Saturday and Sunday.
					'lastweekend', // the last occurrence of the weekend before today’s day. Weekend is defined as Saturday and Sunday.

				].includes(param) ||

				/^next(\d+)days$/.test(param) ||
				/^last(\d+)days$/.test(param) ||

				/^next(saturday|sunday|monday|tuesday|wednesday|thursday|friday)$/.test(param) ||
				/^last(saturday|sunday|monday|tuesday|wednesday|thursday|friday)$/.test(param)
			){
				return param;
			}
			else
			// using date format for date1 or date1 and date2
			if(/^\d{4,4}\-\d{2,2}\-\d{2,2}$/.test(param)){
				return param;
			}
			else
			// using datetime format
			if(/^\d\d\d\d\-\d\d\-\d\dT\d\d\:\d\d\:\d\d$/.test(param)){
				return param;
			}
			else{
				throw new Error(`Weather.validateParamDate: Invalid date '${param}'.`);
			}
		}
		else
		if(typeof param === 'number'){
			return param;
		}
		else{
			throw new TypeError(`Weather.validateParamDate: Invalid date type '${typeof param}'.`);
		}
	}

	/**
	 * @method   validateParamUnitGroup
	 * @static
	 * @memberof module:weather.Weather
	 * @param    {string} param - The system of units used for the output data.
	 * @returns  {string} The validated unitGroup to specify the units that will be used when returning weather data.
	 * @desc     Validate and return the system of units used for the output data.
	 * @throws   {TypeError|Error} If the input data type is not a string, or an unsupported value is used.
	 */
	static validateParamUnitGroup(param){
		if(typeof param === 'string'){
			if(['us', 'uk', 'metric', 'base'].includes(param)){
				return param;
			}
			else{
				throw new Error(`Weather.validateParamUnitGroup: Invalid unitGroup value '${param}'.`);
			}
		}
		else{
			throw new TypeError(`Weather.validateParamUnitGroup: Invalid unitGroup type '${typeof param}'.`);
		}
	}

	/**
	 * @method   validateParamInclude
	 * @static
	 * @memberof module:weather.Weather
	 * @param    {Array<string>} param - The sections to include in the result data.
	 * @returns  {string} The validated sections to include in the result data as a comma separated list.
	 * @desc     Specifies the sections to include in the result data.
	 * @throws   {TypeError|Error} If the input data type is not a string, or an unsupported value is used.
	 */
	static validateParamInclude(...param){
		for(let p of param){
			if(typeof p === 'string'){
				if(![
					'days',      // daily data
					'hours',     // hourly data
					'minutes',   // minutely data (beta). See Requesting sub-hourly data in the Timeline Weather API.
					'alerts',    // weather alerts
					'current',   // current conditions or conditions at requested time.
					'events',    // historical events such as a hail, tornadoes, wind damage and earthquakes (not enabled by default).
					'obs',       // historical observations from weather stations.
					'remote',    // historical observations from remote source such as satellite or radar.
					'fcst',      // forecast based on 16 day models.
					'stats',     // historical statistical normals and daily statistical forecast.
					'statsfcst', // use the full statistical forecast information for dates in the future beyond the current model forecast.
				].includes(p)){
					throw new Error(`Weather.validateParamInclude: Invalid include parameter '${p}'.`);
				}
			}
			else{
				throw new TypeError(`Weather.validateParamInclude: Invalid include parameter type '${typeof p}'.`);
			}
		}
		return param.join(',');
	}

	/**
	 * @method   validateParamElements
	 * @static
	 * @memberof module:weather.Weather
	 * @param    {Array<string>} param - The specific weather elements to include in the result data.
	 * @returns  {string} The validated weather elements to include in the result data as a comma separated list.
	 * @desc     Specifies the specific weather elements to include in the result data.
	 * @throws   {TypeError|Error} If the input data type is not a string, or an unsupported value is used.
	 */
	static validateParamElements(...param){
		for(let p of param){
			if(typeof p === 'string'){
				if(![
					'tempmax',
					'tempmin',
					'temp',
					'feelslikemax',
					'feelslikemin',
					'feelslike',
					'dew',
					'humidity',
					'precip',
					'precipprob',
					'precipcover',
					'preciptype',
					'snow',
					'snowdepth',
					'windgust',
					'windspeed',
					'winddir',
					'pressure',
					'cloudcover',
					'visibility',
					'solarradiation',
					'solarenergy',
					'uvindex',
					'sunrise',
					'sunriseEpoch',
					'sunset',
					'sunsetEpoch',
					'moonphase',
					'conditions',
					'description',
					'icon',
					'icon',
					'stations',
					'source',
				].includes(p)){
					throw new Error(`Weather.validateParamElements: Invalid elements parameter '${p}'.`);
				}
			}
			else{
				throw new TypeError(`Weather.validateParamElements: Invalid elements parameter type '${typeof p}'.`);
			}
		}
		return param.join(',');
	}

	/**
	 * @method   fetchWeatherData
	 * @instance
	 * @async
	 * @memberof module:weather.Weather
	 * @param    {string} location - Location for which weather data is requested.
	 * @param    {string} fromDate - Start date of the weather data period (in `yyyy-MM-dd` format).
	 * @param    {string} toDate - End date of the weather data period (in `yyyy-MM-dd` format).
	 * @param    {string} unitGroup - Unit system for the weather data ('us', 'metric', 'uk' or 'base').
	 * @param    {string} include - Data types to include (e.g., 'days', 'hours').
	 * @param    {string} elements - Specific weather elements to retrieve.
	 * @returns  {Promise<object>} The weather data as a dictionary.
	 * @desc     Fetch weather data for a specified location and date range.
	 */
	async fetchWeatherData(location, fromDate = '', toDate = '', unitGroup = 'metric', include = '', elements = ''){
		try{
			if(!this.apiKey){
				throw new Error('Weather.fetchWeatherData: No API key or session found.');
			}

			if(!location){
				throw new Error('Weather.fetchWeatherData: Bad API Request:A location must be specified.');
			}

			let queryParams = new URLSearchParams({
				key : this.apiKey,
				lang: 'en',
				contentType: 'json',
				unitGroup,
				include,
				elements,
			});

			let url;
			if(fromDate)
				url = `${BASE_URL}/${location}/${fromDate}/${toDate}?${queryParams}`;
			else
				url = `${BASE_URL}/${location}/?${queryParams}`;

			if(globalThis.fetch){
				const response = await fetch(url);

				if(!response.ok){
					throw new Error(await response.text());
				}
				this.#weatherData = await response.json();

				return this.#weatherData;
			}
			else{
				return new Promise((resolve, reject) => {

					let cr = https.request(url, (response) => {

						response.setEncoding('utf8');
						let body = '';

						response.on('data', (chunk) => { body += chunk });
						response.on('end', () => {
							if(response.statusCode >= 200 && response.statusCode < 300){
								resolve(JSON.parse(body));
							}
							else{
								reject(body);
							}
						});
					});
					cr.end();
				});
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   clearWeatherData
	 * @instance
	 * @memberof module:weather.Weather
	 * @desc     Clear the weather data of the class.
	 */
	clearWeatherData(){
		this.#weatherData = {};
	}

	/**
	 * Data Elements
	 *
	 * @method   getWeatherData
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {Array<string>} elements - List of elements to include in the returned data.
	 * @returns  {object|null} The weather data as a dictionary, filtered by elements if specified, or null for errors.
	 * @desc     Get the stored weather data.
	 */
	getWeatherData(elements = []){
		try{
			if(elements.length > 0){
				return extractSubobjectByKeys(this.#weatherData, elements);
			}
			else{
				return this.#weatherData;
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   setWeatherData
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {object} data - Weather data to store.
	 * @desc     Set the internal weather data.
	 */
	setWeatherData(data){
		this.#weatherData = data;
	}

	/**
	 * Data Elements
	 *
	 * @method   getWeatherDailyData
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {Array<string>} elements - List of elements to include in the returned data.
	 * @returns  {Array<object>|null} List of daily data dictionaries, filtered by elements if specified, or null for errors.
	 * @desc     Get daily weather data, optionally filtered by elements.
	 */
	getWeatherDailyData(elements = []){
		try{
			if(elements.length > 0){
				return this.#weatherData.days.map(day => extractSubobjectByKeys(day, elements));
			}
			else{
				return this.#weatherData.days;
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   setWeatherDailyData
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {Array<object>} dailyData - List of daily weather data dictionaries.
	 * @desc     Set the daily weather data.
	 */
	setWeatherDailyData(dailyData){
		this.#weatherData.days = dailyData;
	}

	/**
	 * Data Elements
	 *
	 * @method   getWeatherHourlyData
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {Array<string>} elements - List of elements to include in the returned data.
	 * @returns  {Array<object>|null} List of hourly data dictionaries, filtered by elements if specified, or null for errors.
	 * @desc     Get hourly weather data for all days, optionally filtered by elements.
	 */
	getWeatherHourlyData(elements = []){
		try{
			const hourlyData = this.#weatherData.days.flatMap(day => day.hours);
			if(elements.length > 0){
				return hourlyData.map(hourDt => extractSubobjectByKeys(hourDt, elements));
			}
			else{
				return hourlyData;
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   getDataOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The identifier for the day, which can be a date string (YYYY-MM-DD) or an index of the day list.
	 * @param    {Array<string>} elements - Specific weather elements to retrieve.
	 * @returns  {object|null} The weather data dictionary for the specified day, or null for errors.
	 * @desc     Retrieves weather data for a specific day based on a date string or index.
	 */
	getDataOnDay(dayInfo, elements = []){
		try{
			let dayData;

			if(typeof dayInfo === 'string'){
				dayData = this.#weatherData.days.find(day => day.datetime === dayInfo);
			}
			else
			if(typeof dayInfo === 'number'){
				dayData = this.#weatherData.days[dayInfo];
			}
			else{
				throw new TypeError(`Weather.getDataOnDay: Invalid input day value '${dayInfo}'.`);
			}

			if(elements.length > 0){
				return extractSubobjectByKeys(dayData, elements);
			}
			else{
				return dayData;
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   setDataOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The identifier for the day, which can be a date string (YYYY-MM-DD) or an index of the day list.
	 * @param    {object} data - The new weather data dictionary to replace the existing day's data.
	 * @desc     Updates weather data for a specific day based on a date string or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setDataOnDay(dayInfo, data){
		try{
			if(typeof dayInfo === 'string'){
				for(let i = 0; i < this.#weatherData.days.length; i++){
					if(this.#weatherData.days[i].datetime === dayInfo){
						this.#weatherData.days[i] = data;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				this.#weatherData.days[dayInfo] = data;
			}
			else{
				throw new TypeError(`Weather.setDataOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   getHourlyDataOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {Array} elements - Optional list of keys to filter the hourly data.
	 * @returns  {Array} A list of hourly data dictionaries for the specified day.
	 * @desc     Retrieves hourly weather data for a specific day identified by date or index. Optionally filters the data to include only specified elements.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	getHourlyDataOnDay(dayInfo, elements = []){
		try{
			let hourlyData;
			if(typeof dayInfo === 'string'){
				hourlyData = this.#weatherData.days.find(day => day.datetime === dayInfo)?.hours || [];
			}
			else
			if(typeof dayInfo === 'number'){
				hourlyData = this.#weatherData.days[dayInfo]?.hours || [];
			}
			else {
				throw new TypeError(`Weather.getHourlyDataOnDay: Invalid input day value '${dayInfo}'.`);
			}

			if(elements.length > 0){
				return hourlyData.map(hour => {
					const filtered = {};
					elements.forEach(el => {
						filtered[el] = hour[el];
					});
					return filtered;
				});
			}
			return hourlyData;
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   setHourlyDataOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {Array} data - The new list of hourly weather data dictionaries to set.
	 * @desc     Sets the hourly weather data for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setHourlyDataOnDay(dayInfo, data){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.hours = data;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				this.#weatherData.days[dayInfo].hours = data;
			}
			else{
				throw new TypeError(`Weather.setHourlyDataOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   getDataAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index, pointing to a specific day in the data.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index, pointing to a specific time slot in the day's data.
	 * @param    {Array} elements - Specific weather elements to retrieve.
	 * @returns  {Object} The specific hourly data dictionary corresponding to the given day and time.
	 * @desc     Retrieves weather data for a specific date and time from the weather data collection.
	 * @throws   {Error} Propagates any exceptions that may occur during data retrieval.
	 */
	getDataAtDatetime(dayInfo, timeInfo, elements = []){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			const data = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);

			if(elements.length){
				return extractSubobjectByKeys(data, elements);
			}
			else{
				return data;
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   setDataAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index, pointing to a specific day in the data.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index, pointing to a specific time slot in the day's data.
	 * @param    {Object} data - The data dictionary to be set for the specific hourly time slot.
	 * @desc     Sets weather data for a specific date and time from the weather data collection.
	 * @throws   {Error} Propagates any exceptions that may occur during data setting.
	 */
	setDataAtDatetime(dayInfo, timeInfo, data){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			Weather.setItemByDatetimeVal(dayItem.hours, timeInfo, data);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   updateDataAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index, pointing to a specific day in the data.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index, pointing to a specific time slot in the day's data.
	 * @param    {Object} data - The data dictionary to be updated for the specific hourly time slot.
	 * @desc     Updates weather data for a specific date and time in the weather data collection.
	 * @throws   {Error} Propagates any exceptions that may occur during data setting.
	 */
	updateDataAtDatetime(dayInfo, timeInfo, data){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			Weather.updateItemByDatetimeVal(dayItem.hours, timeInfo, data);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   getDatetimeEpochAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number} The epoch time corresponding to the specific day and time.
	 * @desc     Retrieves the epoch time for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during data retrieval.
	 */
	getDatetimeEpochAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			return Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).datetimeEpoch;
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   setDatetimeEpochAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The epoch time value to be set.
	 * @desc     Sets the epoch time for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setDatetimeEpochAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).datetimeEpoch = value;
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Data Elements
	 *
	 * @method   getDailyDatetimes(
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {Array<Date>} A list of Date objects parsed from the 'datetime' key of each day in the weather data.
	 * @desc     Retrieves a list of datetime objects representing each day's date from the weather data.
	 */
	getDailyDatetimes(){
		return this.#weatherData.days.map(day => new Date(day.datetime));
	}

	/**
	 * Data Elements
	 *
	 * @method   getHourlyDatetimes
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {Array<Date>} A list of Date objects parsed from the 'datetime' keys of each day and hour in the weather data.
	 * @desc     Retrieves a list of datetime objects representing each hour's datetime from the weather data.
	 */
	getHourlyDatetimes(){
		return this.#weatherData.days.flatMap(day =>
			day.hours.map(hour => new Date(`${day.datetime}T${hour.datetime}`))
		);
	}

	/**
	 * Location Elements
	 *
	 * @method   getLatitude
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {number|null} The latitude if available, otherwise null.
	 * @desc     Retrieves the latitude from the weather data.
	 */
	getLatitude(){
		return this.#weatherData.latitude === 0 ? 0 : (this.#weatherData.latitude || null);
	}

	/**
	 * Location Elements
	 *
	 * @method   setLatitude
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {number} value - The new latitude to be set.
	 * @desc     Sets the latitude in the weather data.
	 * @throws   {RangeError} If the latitude value is out of <-90, 90> range.
	 */
	setLatitude(value){
		if(value < -90 || value > 90)
			throw new RangeError(`Weather.setLatitude: invalid latitude value '${value}'.`);

		this.#weatherData.latitude = value;
	}

	/**
	 * Location Elements
	 *
	 * @method   getLongitude
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {number|null} The longitude if available, otherwise null.
	 * @desc     Retrieves the longitude from the weather data.
	 */
	getLongitude(){
		return this.#weatherData.longitude === 0 ? 0 : (this.#weatherData.longitude || null);
	}

	/**
	 * Location Elements
	 *
	 * @method   setLongitude
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {number} value - The new longitude to be set.
	 * @desc     Sets the longitude in the weather data.
	 * @throws   {RangeError} If the longitude value is out of <-180, 180> range.
	 */
	setLongitude(value){
		if(value < -180 || value > 180)
			throw new RangeError(`Weather.setLongitude: invalid longitude value '${value}'.`);

		this.#weatherData.longitude = value;
	}

	/**
	 * Location Elements
	 *
	 * @method   getResolvedAddress
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {string|null} The resolved address if available, otherwise null.
	 * @desc     Retrieves the resolved address from the weather data.
	 */
	getResolvedAddress(){
		return this.#weatherData.resolvedAddress || null;
	}

	/**
	 * Location Elements
	 *
	 * @method   setResolvedAddress
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string} value - The new resolved address to be set.
	 * @desc     Sets the resolved address in the weather data.
	 */
	setResolvedAddress(value){
		this.#weatherData.resolvedAddress = value;
	}

	/**
	 * Location Elements
	 *
	 * @method   getAddress
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {string|null} The address if available, otherwise null.
	 * @desc     Retrieves the address from the weather data.
	 */
	getAddress(){
		return this.#weatherData.address || null;
	}

	/**
	 * Location Elements
	 *
	 * @method   setAddress
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string} value - The new address to be set.
	 * @desc     Sets the address in the weather data.
	 */
	setAddress(value){
		this.#weatherData.address = value;
	}

	/**
	 * Location Elements
	 *
	 * @method   getTimezone
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {string|null} The timezone if available, otherwise null.
	 * @desc     Retrieves the timezone from the weather data.
	 */
	getTimezone(){
		return this.#weatherData.timezone || null;
	}

	/**
	 * Location Elements
	 *
	 * @method   setTimezone
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string} value - The new timezone to be set.
	 * @desc     Sets the timezone in the weather data.
	 */
	setTimezone(value){
		this.#weatherData.timezone = value;
	}

	/**
	 * Location Elements
	 *
	 * @method   getTzoffset
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {number|null} The timezone offset if available, otherwise null.
	 * @desc     Retrieves the timezone offset from the weather data.
	 */
	getTzoffset(){
		return this.#weatherData.tzoffset === 0 ? 0 : (this.#weatherData.tzoffset || null);
	}

	/**
	 * Location Elements
	 *
	 * @method   setTzoffset
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {number} value - The new timezone offset to be set.
	 * @desc     Sets the timezone offset in the weather data.
	 */
	setTzoffset(value){
		this.#weatherData.tzoffset = value;
	}

	/**
	 * Request Elements
	 *
	 * @method   getQueryCost
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {number|null} The cost of the query if available, otherwise null.
	 * @desc     Retrieves the cost of the query from the weather data.
	 */
	getQueryCost(){
		return this.#weatherData.queryCost || null;
	}

	/**
	 * Request Elements
	 *
	 * @method   setQueryCost
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {number} value - The new cost to be set for the query.
	 * @desc     Sets the cost of the query in the weather data.
	 */
	setQueryCost(value){
		this.#weatherData.queryCost = value;
	}

	/**
	 * Request Elements
	 *
	 * @method   getStations
	 * @instance
	 * @memberof module:weather.Weather
	 * @returns  {Array} The list of weather stations if available, otherwise an empty list.
	 * @desc     Retrieves the list of weather stations from the weather data.
	 */
	getStations(){
		return this.#weatherData.stations || [];
	}

	/**
	 * Request Elements
	 *
	 * @method   setStations
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {Array} value - The new list of weather stations to be set.
	 * @desc     Sets the list of weather stations in the weather data.
	 */
	setStations(value){
		this.#weatherData.stations = value;
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getTempOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The temperature for the specified day, or null if not available or error.
	 * @desc     Retrieves the temperature for a specific day identified by date or index.
	 */
	getTempOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.temp;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.temp;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getTempOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setTempOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new temperature value to set.
	 * @desc     Sets the temperature for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setTempOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				let day = this.#weatherData.days.find(day => day.datetime === dayInfo);
				if(day) day.temp = value;
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.temp = value;
			}
			else {
				throw new TypeError(`Weather.setTempOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getTempmaxOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The maximum temperature for the specified day, or null if not available or error.
	 * @desc     Retrieves the maximum temperature for a specific day identified by date or index.
	 */
	getTempmaxOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.tempmax;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.tempmax;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getTempmaxOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setTempmaxOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new maximum temperature value to set.
	 * @desc     Sets the maximum temperature for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setTempmaxOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.tempmax = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.tempmax = value;
			}
			else{
				throw new TypeError(`Weather.setTempmaxOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getTempminOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The minimum temperature for the specified day, or null if not available or error.
	 * @desc     Retrieves the minimum temperature for a specific day identified by date or index.
	 */
	getTempminOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.tempmin;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.tempmin;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getTempminOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setTempminOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new minimum temperature value to set.
	 * @desc     Sets the minimum temperature for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setTempminOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.tempmin = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.tempmin = value;
			}
			else{
				throw new TypeError(`Weather.setTempminOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getFeelslikeOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The 'feels like' temperature for the specified day, or null if not available or error.
	 * @desc     Retrieves the 'feels like' temperature for a specific day identified by date or index.
	 */
	getFeelslikeOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.feelslike;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.feelslike;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getFeelslikeOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setFeelslikeOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new 'feels like' temperature value to set.
	 * @desc     Sets the 'feels like' temperature for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setFeelslikeOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.feelslike = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.feelslike = value;
			}
			else{
				throw new TypeError(`Weather.setFeelslikeOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getFeelslikemaxOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The maximum 'feels like' temperature for the specified day, or null if not available or error.
	 * @desc     Retrieves the maximum 'feels like' temperature for a specific day identified by date or index.
	 */
	getFeelslikemaxOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.feelslikemax;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.feelslikemax;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getFeelslikemaxOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setFeelslikemaxOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new maximum 'feels like' temperature value to set.
	 * @desc     Sets the maximum 'feels like' temperature for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setFeelslikemaxOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.feelslikemax = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.feelslikemax = value;
			}
			else{
				throw new TypeError(`Weather.setFeelslikemaxOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getFeelslikeminOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The minimum 'feels like' temperature for the specified day, or null if not available or error.
	 * @desc     Retrieves the minimum 'feels like' temperature for a specific day identified by date or index.
	 */
	getFeelslikeminOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.feelslikemin;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.feelslikemin;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getFeelslikeminOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setFeelslikeminOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new minimum temperature value to set.
	 * @desc     Sets the minimum 'feels like' temperature for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setFeelslikeminOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.feelslikemin = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.feelslikemin = value;
			}
			else{
				throw new TypeError(`Weather.setFeelslikeminOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getDewOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The dew point for the specified day, or null if not available or error.
	 * @desc     Retrieves the dew point for a specific day identified by date or index.
	 */
	getDewOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.dew;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.dew;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getDewOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setDewOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new dew point value to set.
	 * @desc     Sets the dew point for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setDewOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.dew = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.dew = value;
			}
			else{
				throw new TypeError(`Weather.setDewOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getHumidityOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The humidity percentage for the specified day, or null if not available or error.
	 * @desc     Retrieves the humidity percentage for a specific day identified by date or index.
	 */
	getHumidityOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.humidity;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.humidity;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getHumidityOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setHumidityOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new humidity percentage value to set.
	 * @desc     Sets the humidity percentage for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setHumidityOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.humidity = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.humidity = value;
			}
			else{
				throw new TypeError(`Weather.setHumidityOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getPrecipOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The precipitation amount for the specified day, or null if not available or error.
	 * @desc     Retrieves the precipitation amount for a specific day identified by date or index.
	 */
	getPrecipOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.precip;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.precip;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getPrecipOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setPrecipOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new precipitation amount value to set.
	 * @desc     Sets the precipitation amount for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setPrecipOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.precip = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.precip = value;
			}
			else{
				throw new TypeError(`Weather.setPrecipOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getPrecipprobOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The probability of precipitation for the specified day, or null if not available or error.
	 * @desc     Retrieves the probability of precipitation for a specific day identified by date or index.
	 */
	getPrecipprobOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.precipprob;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.precipprob;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getPrecipprobOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setPrecipprobOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new probability of precipitation value to set.
	 * @desc     Sets the probability of precipitation for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setPrecipprobOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.precipprob = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.precipprob = value;
			}
			else{
				throw new TypeError(`Weather.setPrecipprobOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getPrecipcoverOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The precipitation coverage for the specified day, or null if not available or error.
	 * @desc     Retrieves the precipitation coverage for a specific day identified by date or index.
	 */
	getPrecipcoverOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.precipcover;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.precipcover;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getPrecipcoverOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setPrecipcoverOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new precipitation coverage value to set.
	 * @desc     Sets the precipitation coverage for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setPrecipcoverOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.precipcover = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.precipcover = value;
			}
			else{
				throw new TypeError(`Weather.setPrecipcoverOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getPreciptypeOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {string|null} The type of precipitation for the specified day, or null if not available or error.
	 * @desc     Retrieves the type of precipitation for a specific day identified by date or index.
	 */
	getPreciptypeOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.preciptype;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.preciptype;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getPreciptypeOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setPreciptypeOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {string} value - The new type of precipitation value to set.
	 * @desc     Sets the type of precipitation for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setPreciptypeOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.preciptype = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.preciptype = value;
			}
			else{
				throw new TypeError(`Weather.setPreciptypeOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getSnowOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The snowfall amount for the specified day, or null if not available or error.
	 * @desc     Retrieves the snowfall amount for a specific day identified by date or index.
	 */
	getSnowOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.snow;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.snow;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getSnowOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setSnowOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new snowfall amount to set.
	 * @desc     Sets the snowfall amount for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSnowOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.snow = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.snow = value;
			}
			else{
				throw new TypeError(`Weather.setSnowOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getSnowdepthOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The snow depth for the specified day, or null if not available or error.
	 * @desc     Retrieves the snow depth for a specific day identified by date or index.
	 */
	getSnowdepthOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.snowdepth;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.snowdepth;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getSnowdepthOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setSnowdepthOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new snow depth to set.
	 * @desc     Sets the snow depth for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSnowdepthOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.snowdepth = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.snowdepth = value;
			}
			else{
				throw new TypeError(`Weather.setSnowdepthOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getWindgustOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The wind gust value for the specified day, or null if not available or error.
	 * @desc     Retrieves the wind gust value for a specific day identified by date or index.
	 */
	getWindgustOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.windgust;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.windgust;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getWindgustOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setWindgustOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new wind gust value to set.
	 * @desc     Sets the wind gust value for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setWindgustOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.windgust = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.windgust = value;
			}
			else{
				throw new TypeError(`Weather.setWindgustOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getWindspeedOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The wind speed for the specified day, or null if not available or error.
	 * @desc     Retrieves the wind speed for a specific day identified by date or index.
	 */
	getWindspeedOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.windspeed;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.windspeed;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getWindspeedOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setWindspeedOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new wind speed value to set.
	 * @desc     Sets the wind speed for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setWindspeedOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.windspeed = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.windspeed = value;
			}
			else{
				throw new TypeError(`Weather.setWindspeedOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getWinddirOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The wind direction for the specified day, or null if not available or error.
	 * @desc     Retrieves the wind direction for a specific day identified by date or index.
	 */
	getWinddirOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.winddir;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.winddir;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getWinddirOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setWinddirOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new wind direction value to set.
	 * @desc     Sets the wind direction for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setWinddirOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.winddir = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.winddir = value;
			}
			else{
				throw new TypeError(`Weather.setWinddirOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getPressureOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The atmospheric pressure for the specified day, or null if not available or error.
	 * @desc     Retrieves the atmospheric pressure for a specific day identified by date or index.
	 */
	getPressureOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.pressure;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.pressure;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getPressureOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setPressureOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new pressure value to set.
	 * @desc     Sets the atmospheric pressure for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setPressureOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.pressure = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.pressure = value;
			}
			else{
				throw new TypeError(`Weather.setPressureOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getCloudcoverOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The cloud cover percentage for the specified day, or null if not available or error.
	 * @desc     Retrieves the cloud cover percentage for a specific day identified by date or index.
	 */
	getCloudcoverOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.cloudcover;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.cloudcover;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getCloudcoverOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setCloudcoverOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new cloud cover percentage to set.
	 * @desc     Sets the cloud cover percentage for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setCloudcoverOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.cloudcover = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.cloudcover = value;
			}
			else{
				throw new TypeError(`Weather.setCloudcoverOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getVisibilityOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The visibility distance for the specified day, or null if not available or error.
	 * @desc     Retrieves the visibility distance for a specific day identified by date or index.
	 */
	getVisibilityOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.visibility;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.visibility;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getVisibilityOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setVisibilityOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new visibility distance to set.
	 * @desc     Sets the visibility distance for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setVisibilityOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.visibility = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.visibility = value;
			}
			else{
				throw new TypeError(`Weather.setVisibilityOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getSolarradiationOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The solar radiation level for the specified day, or null if not available or error.
	 * @desc     Retrieves the solar radiation level for a specific day identified by date or index.
	 */
	getSolarradiationOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.solarradiation;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.solarradiation;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getSolarradiationOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setSolarradiationOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new solar radiation level to set.
	 * @desc     Sets the solar radiation level for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSolarradiationOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.solarradiation = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.solarradiation = value;
			}
			else{
				throw new TypeError(`Weather.setSolarradiationOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getSolarenergyOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The solar energy generated on the specified day, or null if not available or error.
	 * @desc     Retrieves the solar energy generated on a specific day identified by date or index.
	 */
	getSolarenergyOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.solarenergy;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.solarenergy;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getSolarenergyOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setSolarenergyOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new solar energy level to set.
	 * @desc     Sets the solar energy level for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSolarenergyOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.solarenergy = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.solarenergy = value;
			}
			else{
				throw new TypeError(`Weather.setSolarenergyOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getUvindexOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The UV index for the specified day, or null if not available or error.
	 * @desc     Retrieves the UV index for a specific day identified by date or index.
	 */
	getUvindexOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.uvindex;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.uvindex;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getUvindexOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setUvindexOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new UV index value to set.
	 * @desc     Sets the UV index for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setUvindexOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.uvindex = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.uvindex = value;
			}
			else{
				throw new TypeError(`Weather.setUvindexOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getSevereriskOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The severe weather risk level for the specified day, or null if not available or error.
	 * @desc     Retrieves the severe weather risk level for a specific day identified by date or index.
	 */
	getSevereriskOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.severerisk;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.severerisk;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getSevereriskOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setSevereriskOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new severe weather risk level to set.
	 * @desc     Sets the severe weather risk level for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSevereriskOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for (let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.severerisk = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.severerisk = value;
			}
			else{
				throw new TypeError(`Weather.setSevereriskOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   getStationsOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {Array|null} The list of weather stations active on the specified day, or null if not available or error.
	 * @desc     Retrieves the weather stations data for a specific day identified by date or index.
	 */
	getStationsOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				return this.#weatherData.days.find(day => day.datetime === dayInfo)?.stations || null;
			}
			else
			if(typeof dayInfo === 'number'){
				return this.#weatherData.days[dayInfo]?.stations || null;
			}
			else {
				throw new TypeError(`Weather.getStationsOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements
	 *
	 * @method   setStationsOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {Array} value - The new list of weather stations to set.
	 * @desc     Sets the weather stations data for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setStationsOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.stations = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.stations = value;
			}
			else{
				throw new TypeError(`Weather.setStationsOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   getSunriseOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {string|null} The sunrise time for the specified day, or null if not available or error.
	 * @desc     Retrieves the sunrise time for a specific day identified by date or index.
	 */
	getSunriseOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				return this.#weatherData.days.find(day => day.datetime === dayInfo)?.sunrise || null;
			}
			else
			if(typeof dayInfo === 'number'){
				return this.#weatherData.days[dayInfo]?.sunrise || null;
			}
			else{
				throw new TypeError(`Weather.getSunriseOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   setSunriseOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {string} value - The new sunrise time value to set.
	 * @desc     Sets the sunrise time for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSunriseOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.sunrise = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.sunrise = value;
			}
			else{
				throw new TypeError(`Weather.setSunriseOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   getSunriseEpochOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The sunrise Unix timestamp for the specified day, or null if not available or error.
	 * @desc     Retrieves the Unix timestamp for the sunrise time for a specific day.
	 */
	getSunriseEpochOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.sunriseEpoch;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.sunriseEpoch;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getSunriseEpochOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   setSunriseEpochOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new sunrise Unix timestamp value to set.
	 * @desc     Sets the Unix timestamp for the sunrise time for a specific day.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSunriseEpochOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.sunriseEpoch = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.sunriseEpoch = value;
			}
			else{
				throw new TypeError(`Weather.setSunriseEpochOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   getSunsetOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {string|null} The sunset time for the specified day, or null if not available or error.
	 * @desc     Retrieves the sunset time for a specific day identified by date or index.
	 */
	getSunsetOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				return this.#weatherData.days.find(day => day.datetime === dayInfo)?.sunset || null;
			}
			else
			if(typeof dayInfo === 'number'){
				return this.#weatherData.days[dayInfo]?.sunset || null;
			}
			else{
				throw new TypeError(`Weather.getSunsetOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   setSunsetOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {string} value - The new sunset time value to set.
	 * @desc     Sets the sunset time for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSunsetOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.sunset = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.sunset = value;
			}
			else{
				throw new TypeError(`Weather.setSunsetOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   getSunsetEpochOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The sunset Unix timestamp for the specified day, or null if not available or error.
	 * @desc     Retrieves the Unix timestamp for the sunset time for a specific day.
	 */
	getSunsetEpochOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.sunsetEpoch;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.sunsetEpoch;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getSunsetEpochOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   setSunsetEpochOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new sunset Unix timestamp value to set.
	 * @desc     Sets the Unix timestamp for the sunset time for a specific day.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setSunsetEpochOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.sunsetEpoch = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.sunsetEpoch = value;
			}
			else{
				throw new TypeError(`Weather.setSunsetEpochOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   getMoonphaseOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {number|null} The moon phase for the specified day, or null if not available or error.
	 * @desc     Retrieves the moon phase for a specific day identified by date or index.
	 */
	getMoonphaseOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				let tmp = this.#weatherData.days.find(day => day.datetime === dayInfo)?.moonphase;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else
			if(typeof dayInfo === 'number'){
				let tmp = this.#weatherData.days[dayInfo]?.moonphase;
				return tmp === 0 ? 0 : (tmp || null);
			}
			else{
				throw new TypeError(`Weather.getMoonphaseOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Astronomy Elements
	 *
	 * @method   setMoonphaseOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {number} value - The new moon phase value to set.
	 * @desc     Sets the moon phase for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setMoonphaseOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.moonphase = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.moonphase = value;
			}
			else{
				throw new TypeError(`Weather.setMoonphaseOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Description Elements
	 *
	 * @method   getConditionsOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {string|null} The weather conditions for the specified day, or null if not available or error.
	 * @desc     Retrieves the weather conditions for a specific day identified by date or index.
	 */
	getConditionsOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				return this.#weatherData.days.find(day => day.datetime === dayInfo)?.conditions || null;
			}
			else
			if(typeof dayInfo === 'number'){
				return this.#weatherData.days[dayInfo]?.conditions || null;
			}
			else{
				throw new TypeError(`Weather.getConditionsOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Description Elements
	 *
	 * @method   setConditionsOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {string} value - The new conditions value to set.
	 * @desc     Sets the weather conditions for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setConditionsOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.conditions = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.conditions = value;
			}
			else{
				throw new TypeError(`Weather.setConditionsOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Description Elements
	 *
	 * @method   getDescriptionOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {string|null} The weather description for the specified day, or null if not available or error.
	 * @desc     Retrieves the weather description for a specific day identified by date or index.
	 */
	getDescriptionOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				return this.#weatherData.days.find(day => day.datetime === dayInfo)?.description || null;
			}
			else
			if(typeof dayInfo === 'number'){
				return this.#weatherData.days[dayInfo]?.description || null;
			}
			else {
				throw new TypeError(`Weather.getDescriptionOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Description Elements
	 *
	 * @method   setDescriptionOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {string} value - The new description to set.
	 * @desc     Sets the weather description for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setDescriptionOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.description = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.description = value;
			}
			else{
				throw new TypeError(`Weather.setDescriptionOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Description Elements
	 *
	 * @method   getIconOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @returns  {string|null} The weather icon for the specified day, or null if not available or error.
	 * @desc     Retrieves the weather icon for a specific day identified by date or index.
	 */
	getIconOnDay(dayInfo){
		try{
			if(typeof dayInfo === 'string'){
				return this.#weatherData.days.find(day => day.datetime === dayInfo)?.icon || null;
			}
			else
			if(typeof dayInfo === 'number'){
				return this.#weatherData.days[dayInfo]?.icon || null;
			}
			else{
				throw new TypeError(`Weather.getIconOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Description Elements
	 *
	 * @method   setIconOnDay
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - The day's date as a string ('YYYY-MM-DD') or index as an integer.
	 * @param    {string} value - The new icon to set.
	 * @desc     Sets the weather icon for a specific day identified by date or index.
	 * @throws   {TypeError} If the dayInfo is neither a string nor a number.
	 */
	setIconOnDay(dayInfo, value){
		try{
			if(typeof dayInfo === 'string'){
				for(let day of this.#weatherData.days){
					if(day.datetime === dayInfo){
						day.icon = value;
						break;
					}
				}
			}
			else
			if(typeof dayInfo === 'number'){
				let day = this.#weatherData.days[dayInfo];
				if(day) day.icon = value;
			}
			else{
				throw new TypeError(`Weather.setIconOnDay: Invalid input day value '${dayInfo}'.`);
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getTempAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The temperature at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the temperature for a specific datetime within the weather data.
	 */
	getTempAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.temp;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getTempAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The temperature value to be set.
	 * @desc     Sets the temperature for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setTempAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).temp = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getFeelsLikeAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The 'feels like' temperature at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the 'feels like' temperature for a specific datetime within the weather data.
	 */
	getFeelsLikeAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.feelslike;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setFeelsLikeAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The 'feels like' temperature value to be set.
	 * @desc     Sets the 'feels like' temperature for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setFeelsLikeAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).feelslike = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getDewAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The dew point temperature at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the dew point temperature for a specific datetime within the weather data.
	 */
	getDewAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.dew;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setDewAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The dew point temperature to be set.
	 * @desc     Sets the dew point temperature for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setDewAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).dew = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getHumidityAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The humidity percentage at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the humidity for a specific datetime within the weather data.
	 */
	getHumidityAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.humidity;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setHumidityAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The humidity percentage to be set.
	 * @desc     Sets the humidity for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setHumidityAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).humidity = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getPrecipAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The precipitation amount at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the precipitation amount for a specific datetime within the weather data.
	 */
	getPrecipAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.precip;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setPrecipAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The precipitation amount to be set.
	 * @desc     Sets the precipitation amount for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setPrecipAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).precip = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getPrecipProbAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The probability of precipitation at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the probability of precipitation for a specific datetime within the weather data.
	 */
	getPrecipProbAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.precipprob;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setPrecipProbAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The probability of precipitation to be set.
	 * @desc     Sets the probability of precipitation for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setPrecipProbAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).precipprob = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getPreciptypeAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {string} The type of precipitation at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the type of precipitation for a specific datetime within the weather data.
	 */
	getPreciptypeAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.preciptype;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setPreciptypeAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {string} value - The type of precipitation to be set.
	 * @desc     Sets the type of precipitation for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setPreciptypeAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).preciptype = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getSnowAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The snow amount at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the snow amount for a specific datetime within the weather data.
	 */
	getSnowAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.snow;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setSnowAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The snow amount to be set.
	 * @desc     Sets the snow amount for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setSnowAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).snow = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getSnowDepthAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The snow depth at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the snow depth for a specific datetime within the weather data.
	 */
	getSnowDepthAtDatetime(dayInfo, timeInfo){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.snowdepth;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setSnowDepthAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The snow depth to be set.
	 * @desc     Sets the snow depth for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setSnowDepthAtDatetime(dayInfo, timeInfo, value){
		try{
			const dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).snowdepth = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getWindgustAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The wind gust speed at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the wind gust speed for a specific datetime within the weather data.
	 */
	getWindgustAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.windgust;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setWindgustAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The wind gust speed to be set.
	 * @desc     Sets the wind gust speed for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setWindgustAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).windgust = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getWindspeedAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The wind speed at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the wind speed for a specific datetime within the weather data.
	 */
	getWindspeedAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.windspeed;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setWindspeedAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The wind speed to be set.
	 * @desc     Sets the wind speed for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setWindspeedAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).windspeed = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getWinddirAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The wind direction at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the wind direction for a specific datetime within the weather data.
	 */
	getWinddirAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.winddir;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setWinddirAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The wind direction to be set.
	 * @desc     Sets the wind direction for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setWinddirAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).winddir = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getPressureAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The atmospheric pressure at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the atmospheric pressure for a specific datetime within the weather data.
	 */
	getPressureAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.pressure;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setPressureAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The atmospheric pressure to be set.
	 * @desc     Sets the atmospheric pressure for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setPressureAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).pressure = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getCloudcoverAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The cloud cover at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the cloud cover for a specific datetime within the weather data.
	 */
	getCloudcoverAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.cloudcover;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setCloudcoverAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The cloud cover to be set.
	 * @desc     Sets the cloud cover for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setCloudcoverAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).cloudcover = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getVisibilityAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The visibility at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the visibility for a specific datetime within the weather data.
	 */
	getVisibilityAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.visibility;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setVisibilityAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The visibility to be set.
	 * @desc     Sets the visibility for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setVisibilityAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).visibility = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getSolarradiationAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The solar radiation at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the solar radiation for a specific datetime within the weather data.
	 */
	getSolarradiationAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.solarradiation;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setSolarradiationAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The solar radiation to be set.
	 * @desc     Sets the solar radiation for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setSolarradiationAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).solarradiation = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getSolarenergyAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The solar energy at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the solar energy for a specific datetime within the weather data.
	 */
	getSolarenergyAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.solarenergy;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setSolarenergyAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The solar energy to be set.
	 * @desc     Sets the solar energy for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setSolarenergyAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).solarenergy = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getUvindexAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The UV index at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the UV index for a specific datetime within the weather data.
	 */
	getUvindexAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.uvindex;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setUvindexAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The UV index to be set.
	 * @desc     Sets the UV index for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setUvindexAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).uvindex = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getSevereriskAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {number|null} The severe risk at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the severe risk for a specific datetime within the weather data.
	 */
	getSevereriskAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.severerisk;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setSevereriskAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {number} value - The severe risk to be set.
	 * @desc     Sets the severe risk for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setSevereriskAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).severerisk = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getStationsAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {string[]|null} The weather stations that were used for creating the observation at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the weather stations that were used for creating the observation for a specific datetime within the weather data.
	 */
	getStationsAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.stations;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setStationsAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {string[]} value - The weather stations to be set.
	 * @desc     Sets the weather stations that were used for creating the observation for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setStationsAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).stations = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   getSourceAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {string|null} The type of weather data used for this weather object at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the type of weather data used for this weather object for a specific datetime within the weather data.
	 *           Values include historical observation (“obs”), forecast (“fcst”), historical forecast (“histfcst”) or statistical forecast (“stats”).
	 *           If multiple types are used in the same day, “comb” is used. Today a combination of historical observations and forecast data.
	 */
	getSourceAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.source;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Core Weather Elements at datetime
	 *
	 * @method   setSourceAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {string} value - The type of weather data to be set.
	 * @desc     Sets the type of weather data used for this weather object for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setSourceAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).source = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Description Elements at datetime
	 *
	 * @method   getConditionsAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {string} The conditions at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the conditions for a specific datetime within the weather data.
	 */
	getConditionsAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.conditions;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Description Elements at datetime
	 *
	 * @method   setConditionsAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {string} value - The conditions to be set.
	 * @desc     Sets the conditions for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setConditionsAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).conditions = value);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * Description Elements at datetime
	 *
	 * @method   getIconAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @returns  {string} The weather icon at the specified datetime, or null if not available or error.
	 * @desc     Retrieves the weather icon for a specific datetime within the weather data.
	 */
	getIconAtDatetime(dayInfo, timeInfo){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);

			if(!dayItem) return dayItem;

			const hourItem = Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo);
			return hourItem && hourItem.icon;
		}
		catch(error){
			return null;
		}
	}

	/**
	 * Description Elements at datetime
	 *
	 * @method   setIconAtDatetime
	 * @instance
	 * @memberof module:weather.Weather
	 * @param    {string|number} dayInfo - A day identifier, which can be a date string (YYYY-MM-DD) or an index.
	 * @param    {string|number} timeInfo - A time identifier, which can be a time string (HH:MM:SS) or an index.
	 * @param    {string} value - The weather icon to be set.
	 * @desc     Sets the weather icon for a specific datetime within the weather data.
	 * @throws   {Error} Propagates any exceptions that may occur during the setting process.
	 */
	setIconAtDatetime(dayInfo, timeInfo, value){
		try{
			let dayItem = Weather.filterItemByDatetimeVal(this.#weatherData.days, dayInfo);
			dayItem && (Weather.filterItemByDatetimeVal(dayItem.hours, timeInfo).icon = value);
		}
		catch(error){
			throw error;
		}
	}
}

Object.defineProperty(Weather.prototype, Symbol.toStringTag, {value: 'Weather', writable: false, enumerable: false, configurable: true});
