# weather-visualcrossing

A JavaScript library to access weather Data from [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api). The library defines a single class **Weather** for fetching and managing weather data. It encapsulates all related weather parameters, stores JSON responses from the Weather API, and provides methods to retrieve and manipulate this data.

[![NPM Version](https://img.shields.io/npm/v/%40essamonline%2Fweather-visualcrossing)](https://www.npmjs.com/package/@essamonline/weather-visualcrossing)
[![NPM Downloads](https://img.shields.io/npm/d18m/%40essamonline%2Fweather-visualcrossing)](https://www.npmjs.com/package/@essamonline/weather-visualcrossing)
[![Coverage Status](https://coveralls.io/repos/github/essamatefelsherif/weather-visualcrossing/badge.svg)](https://coveralls.io/github/essamatefelsherif/weather-visualcrossing)


## References

* [Visual Crossing](https://www.visualcrossing.com/) Global Weather Data & API provider.
* [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api/) Sign up for free to query Global Weather Data API.
* [Visual Crossing Weather API Documentation](https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/) Weather Data API Documentation.
* [Visual Crossing Libraries](https://github.com/visualcrossing/Libraries/tree/main/JavaScript) This package is a fork from this library.


## Installation

```sh
npm install [-g] @essamonline/weather-visualcrossing
```


## Usage

With ESM or TypeScript:

```js
import { Weather } from '@essamonline/weather-visualcrossing';
```
Sign up for a Visual Crossing free account to obtain an API key and include in a file called '**.api-key**' located at the package root directory.


## Weather class

```
class Weather{

	#weatherData;

	constructor(apiKey = '', baseUrl = BASE_URL)

	/*** Static Methods [7] ***/

	static filterItemByDatetimeVal (src, datetimeVal)         // throws
	static setItemByDatetimeVal    (src, datetimeVal, data)   // throws
	static updateItemByDatetimeVal (src, datetimeVal, data)   // throws

	static validateParamDate      (param)                     // throws
	static validateParamUnitGroup (param)                     // throws
	static validateParamInclude   (...param)                  // throws
	static validateParamElements  (...param)                  // throws

	/*** Instance Method - fetchWeatherData [1] ***/

	async fetchWeatherData(
		location,
		fromDate = '', toDate = '',
		unitGroup = 'metric', include = '', elements = '')    // throws

	/*** Instance Methods - Data Elements [17] ***/

	clearWeatherData()
	getWeatherData(elements = [])
	setWeatherData(data)

	getWeatherDailyData(elements = [])
	setWeatherDailyData(dailyData)

	getWeatherHourlyData(elements = [])

	getDataOnDay(dayInfo, elements = [])
	setDataOnDay(dayInfo, data)                            // throws

	getHourlyDataOnDay(dayInfo, elements = [])             // throws
	setHourlyDataOnDay(dayInfo, data)                      // throws

	getDataAtDatetime(dayInfo, timeInfo, elements = [])    // throws
	setDataAtDatetime(dayInfo, timeInfo, data)             // throws
	updateDataAtDatetime(dayInfo, timeInfo, data)          // throws

	getDatetimeEpochAtDatetime(dayInfo, timeInfo)          // throws
	setDatetimeEpochAtDatetime(dayInfo, timeInfo, value)   // throws

	getDailyDatetimes()
	getHourlyDatetimes()

	/*** Instance Methods - Location Elements [12] ***/

	getLatitude()
	setLatitude(value)                                     // throws

	getLongitude()
	setLongitude(value)                                    // throws

	getResolvedAddress()
	setResolvedAddress(value)

	getAddress()
	setAddress(value)

	getTimezone()
	setTimezone(value)

	getTzoffset()
	setTzoffset(value)

	/*** Instance Methods - Request Elements [4] ***/

	getQueryCost()
	setQueryCost(value)

	getStations()
	setStations(value)

	/*** Instance Methods - Core Weather Elements [50] ***/

	getTempOnDay(dayInfo)
	setTempOnDay(dayInfo, value)                           // throws

	getTempmaxOnDay(dayInfo)
	setTempmaxOnDay(dayInfo, value)                        // throws

	getTempminOnDay(dayInfo)
	setTempminOnDay(dayInfo, value)                        // throws

	getFeelslikeOnDay(dayInfo)
	setFeelslikeDay(dayInfo, value)                        // throws

	getFeelslikemaxOnDay(dayInfo)
	setFeelslikemaxDay(dayInfo, value)                     // throws

	getFeelslikeminOnDay(dayInfo)
	setFeelslikeminDay(dayInfo, value)                     // throws

	getDewOnDay(dayInfo)
	setDewOnDay(dayInfo, value)                            // throws

	getHumidityOnDay(dayInfo)
	setHumidityOnDay(dayInfo, value)                       // throws

	getPrecipOnDay(dayInfo)
	setPrecipOnDay(dayInfo, value)                         // throws

	getPrecipprobOnDay(dayInfo)
	setPrecipprobOnDay(dayInfo, value)                     // throws

	getPrecipcoverOnDay(dayInfo)
	setPrecipcoverOnDay(dayInfo, value)                    // throws

	getPreciptypeOnDay(dayInfo)
	setPreciptypeOnDay(dayInfo, value)                     // throws

	getSnowOnDay(dayInfo)
	setSnowOnDay(dayInfo, value)                           // throws

	getSnowdepthOnDay(dayInfo)
	setSnowdepthOnDay(dayInfo, value)                      // throws

	getWindgustOnDay(dayInfo)
	setTWindgustOnDay(dayInfo, value)                      // throws

	getWindspeedOnDay(dayInfo)
	setTWindspeedOnDay(dayInfo, value)                     // throws

	getWinddirOnDay(dayInfo)
	setTWinddirOnDay(dayInfo, value)                       // throws

	getPressureOnDay(dayInfo)
	setPressueOnDay(dayInfo, value)                        // throws

	getCloudcoverOnDay(dayInfo)
	setCloudcoverOnDay(dayInfo, value)                     // throws

	getVisibilityOnDay(dayInfo)
	setVisibilityOnDay(dayInfo, value)                     // throws

	getSolarradiationOnDay(dayInfo)
	setSolarradiationOnDay(dayInfo, value)                 // throws

	getSolarenergyOnDay(dayInfo)
	setSolarenergyOnDay(dayInfo, value)                    // throws

	getUvindexOnDay(dayInfo)
	setUvindexOnDay(dayInfo, value)                        // throws

	getSevereriskOnDay(dayInfo)
	setSevereriskOnDay(dayInfo, value)                     // throws

	getStationsOnDay(dayInfo)
	setStationsOnDay(dayInfo, value)                       // throws

	/*** Instance Methods - Astronomy Elements [10] ***/

	getSunriseOnDay(dayInfo)
	setSunriseOnDay(dayInfo, value)                         // throws

	getSunriseEpochOnDay(dayInfo)
	setSunriseEpochOnDay(dayInfo, value)                    // throws

	getSunsetOnDay(dayInfo)
	setSunsetOnDay(dayInfo, value)                          // throws

	getSunsetEpochOnDay(dayInfo)
	setSunsetEpochOnDay(dayInfo, value)                     // throws

	getMoonphaseOnDay(dayInfo)
	setMoonphaseOnDay(dayInfo, value)                       // throws

	/*** Instance Methods - Description Elements [6] ***/

	getConditionsOnDay(dayInfo)
	setConditionsOnDay(dayInfo, value)                      // throws

	getDescriptionOnDay(dayInfo)
	setDescriptionOnDay(dayInfo, value)                     // throws

	getIconOnDay(dayInfo)
	setIconOnDay(dayInfo, value)                            // throws

	/*** Instance Methods - Core Weather Elements at datetime [42] ***/

	getTempAtDatetime(dayInfo, timeInfo)
	setTempAtDatetime(dayInfo, timeInfo, value)             // throws

	getFeelslikeAtDatetime(dayInfo, timeInfo)
	setFeelslikeDay(dayInfo, timeInfo, value)               // throws

	getDewAtDatetime(dayInfo, timeInfo)
	setDewAtDatetime(dayInfo, timeInfo, value)              // throws

	getHumidityAtDatetime(dayInfo, timeInfo)
	setHumidityAtDatetime(dayInfo, timeInfo, value)         // throws

	getPrecipAtDatetime(dayInfo, timeInfo)
	setPrecipAtDatetime(dayInfo, timeInfo, value)           // throws

	getPrecipprobAtDatetime(dayInfo, timeInfo)
	setPrecipprobAtDatetime(dayInfo, timeInfo, value)       // throws

	getPreciptypeAtDatetime(dayInfo, timeInfo)
	setPreciptypeAtDatetime(dayInfo, timeInfo, value)       // throws

	getSnowAtDatetime(dayInfo, timeInfo)
	setSnowAtDatetime(dayInfo, timeInfo, value)             // throws

	getSnowdepthAtDatetime(dayInfo, timeInfo)
	setSnowdepthAtDatetime(dayInfo, timeInfo, value)        // throws

	getWindgustAtDatetime(dayInfo, timeInfo)
	setTWindgustAtDatetime(dayInfo, timeInfo, value)        // throws

	getWindspeedAtDatetime(dayInfo, timeInfo)
	setTWindspeedAtDatetime(dayInfo, timeInfo, value)       // throws

	getWinddirAtDatetime(dayInfo, timeInfo)
	setTWinddirAtDatetime(dayInfo, timeInfo, value)         // throws

	getPressureAtDatetime(dayInfo, timeInfo)
	setPressueAtDatetime(dayInfo, timeInfo, value)          // throws

	getCloudcoverAtDatetime(dayInfo, timeInfo)
	setCloudcoverAtDatetime(dayInfo, timeInfo, value)       // throws

	getVisibilityAtDatetime(dayInfo, timeInfo)
	setVisibilityAtDatetime(dayInfo, timeInfo, value)       // throws

	getSolarradiationAtDatetime(dayInfo, timeInfo)
	setSolarradiationAtDatetime(dayInfo, timeInfo, value)   // throws

	getSolarenergyAtDatetime(dayInfo, timeInfo)
	setSolarenergyAtDatetime(dayInfo, timeInfo, value)      // throws

	getUvindexAtDatetime(dayInfo, timeInfo)
	setUvindexAtDatetime(dayInfo, timeInfo, value)          // throws

	getSevereriskAtDatetime(dayInfo, timeInfo)
	setSevereriskAtDatetime(dayInfo, timeInfo, value)       // throws

	getStationsAtDatetime(dayInfo, timeInfo)
	setStationsAtDatetime(dayInfo, timeInfo, value)         // throws

	getSourceAtDatetime(dayInfo, timeInfo)
	setSourceAtDatetime(dayInfo, timeInfo, value)           // throws

	/*** Instance Methods - Description Elements at datetime [4] ***/

	getConditionsAtDatetime(dayInfo, timeInfo)
	setConditionsAtDatetime(dayInfo, timeInfo, value)       // throws

	getIconAtDatetime(dayInfo, timeInfo)
	setIconAtDatetime(dayInfo, timeInfo, value)             // throws
}
```

## Testing

**weather-visualcrossing** was tested using [node:test](https://nodejs.org/docs/latest-v20.x/api/test.html) module facilitates.


## Documentation

Source code documentation, along with a test coverage report are both included under [Documentation](https://essamatefelsherif.github.io/weather-visualcrossing/ "Documentation").


## License

This software is licensed under the MIT license, see the [LICENSE](./LICENSE "LICENSE") file.
