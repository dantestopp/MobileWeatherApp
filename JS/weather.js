var weather = function(){
	
	var _ = this;

	_.handlebarsTemplates = {};

	_.settings = {
		apiKey: "c7d8ac7641d0dd28540a2ec9fc2eb571",
		numberOfDayForecast: 5,
		units: "metric"
	};

	_.getLocationsWithName = function(name, callback){
		$.ajax({
						url:"http://api.openweathermap.org/data/2.5/find",
						dataType: "JSON",
						method: "GET",
						data: {
							q: name,
							APPID: _.settings.apiKey,
							type: "like",
							mode: "JSON"
						}
					}).done(function(d){
						if(d.list.length == 0){
							callback(false);
						}
						callback(null,d);
					}).error(function(err){
						callback(err);
					});
	};

	_.getForecast = function(arr, callback){
		var data = {
					APPID: _.settings.apiKey,
					mode: "JSON",
					units: _.settings.units,
					cnt: _.settings.numberOfDayForecast
				};
		if(arr.id){
			data.id = arr.id;
		}else if(arr.lat && arr.lon){
			data.lat = arr.lat;
			data.lon = arr.lon;
		}else{
			callback(false);
		}
		$.ajax({
				url: "http://api.openweathermap.org/data/2.5/forecast/daily",
				dataType: 'JSON',
				method: "GET",
				data: data
			}).done(function(d){
				return callback(null, d);
			}).error(function(err){
				return callback(err);
			});
	}

	_.setItemInLocalStorage = function(name, data){
		localStorage.setItem(name, JSON.stringify(data));
	};

	_.getItemFromLocalStorage = function(name){
		return JSON.parse(localStorage.getItem(name)) || false;
	};

	_.removeItemFromLocalStorage = function(name){
		localStorage.removeItem(name);
	};
	_.getAndRemoveItemFromLocalStorage = function(name){
		var value = _.getItemFromLocalStorage(name);
		_.removeItemFromLocalStorage(name);
		return value;
	}

	_.setLocationInLocationList = function(id){
		var locations = _.getItemFromLocalStorage('locations');
		if(locations.length <= 0 || locations == false){
					localStorage.setItem('locations', JSON.stringify(new Array()));
				}
		var arr = JSON.parse(localStorage.getItem('locations'));
		arr.push(id);
		//Delete same Locations out of Array
		arr = $.unique(arr);
		localStorage.setItem('locations', JSON.stringify(arr));
	};

	_.getLocationList = function(){
		return JSON.parse(localStorage.getItem('locations'));
	}

	_.removeLocationsFromLocationList = function(ids){
		if(!ids.isArray()){
			ids = [ids];
		}
		var arr = JSON.parse(localStorage.getItem('locations'));
		arr.remove(ids);
		localStorage.setItem('locations', JSON.stringify(arr));
	};

	_.setTemplate = function(name){
		if(!name || typeof(name)!=="string"){
			return false;
		}
		var source = $("#"+name).html();
		_.handlebarsTemplates[name] = Handlebars.compile(source);
	};
	
	_.renderTemplate = function(name, data){
		if(!name || typeof(name)!=="string" || !data || !_.handlebarsTemplates[name]){
			return false;
		}
		return _.handlebarsTemplates[name](data);
	};
	
	_.isLocalStorageSupported = function(){
	    try {
	        localStorage.setItem('weather','weather');
	        localStorage.removeItem('weather');
	        return true;
	    } catch(e) {
	        return false;
	    }
	};

	_.isGeoLocationSupported = function(){
    		if (navigator.geolocation) {
    			return true;
    		}else{
    			return false;
    		}
	};

	_.toggleElementAfterNSeconds = function(elementName, seconds){
			if(!elementName && typeof(elementName)!=="string"){
				return false;
			}
			if(typeof(seconds)!=="int"){
				seconds = 5;
			}
			$(elementName).toggle();
			setTimeout(function(){
    			$(elementName).toggle();
		   	},seconds*1000);
	};

};

if (!Array.prototype.remove) {
  	Array.prototype.remove = function(vals) {
    var i, removedItems = [];
    if (!Array.isArray(vals)) vals = [vals];
    for (var j=0;j<vals.length; j++) {
        i = this.indexOf(vals[j]);
        if(i>-1) removedItems.push(this.splice(i, 1));
    }
    return removedItems;
  };
}
var w = new weather();