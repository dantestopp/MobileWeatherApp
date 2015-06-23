var weather = function(){
	
	var _ = this;

	_.handlebarsTemplates = {};

	_.settings = {
		apiKey: "c7d8ac7641d0dd28540a2ec9fc2eb571",
		numberOfDayForecast: 5,
		units: "metric"
	};

	_.getLocationsWithName = function(name){
		$.ajax({
						url:"http://api.openweathermap.org/data/2.5/find",
						dataType: "JSON",
						method: "GET",
						data: {
							q: encodeURIComponent(name),
							APPID: _.settings.apiKey,
							type: "like",
							mode: "JSON"
						}
					}).done(function(d){
						if(d.list.length == 0){
							return false;
						}
						return d;
					}).error(function(err){
						return false;
					});
	};

	_.getForecast = function(arr, callback){
		var data: {
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
			return false;
		}
		$.ajax({
				url: "http://api.openweathermap.org/data/2.5/forecast/daily",
				dataType: 'JSON',
				method: "GET",
				data: data
			}).done(function(d){
				return callback(false, d);
			}).error(function(err){
				return callback(err);
			});
	}

	_.setItemInLocalStorage = function(name,data){
		localStorage.setItem(name, JSON.stringify(d));
	};

	_.getItemFromLocalStorage = function(name){
		return JSON.parse(localStorage.getItem(name));
	};

	_.removeLocationInLocalStorage = function(name){
		localStorage.removeItem(name);
	};

	_.setLocationInLocationList = function(data){
		if(typeof(localStorage.getItem('locations')) === "undefined" || localStorage.getItem('locations').length <= 0){
					localStorage.setItem('locations', JSON.stringify(new Array()));
				}
		var arr = JSON.parse(localStorage.getItem('locations'));
		arr.push(data.city.id);
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
		if(!name || typeof(name)!=="string" || !data || _.handlebarsTemplates.indexOf(name)<0){
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