$(document).ready(function(){
	//Startpage
 	window.location.hash = "main";

	w.setTemplate("mainListItem");
	w.setTemplate("detailPage");
	w.setTemplate("searchResultsTemplate");


	$("#add").ready(function(){
		$("#searchLocation").keypress(function(e) {
			//If Enter is pressed
			 if(e.which == 13) {
				$("#searchResults").empty();
				var q = $("#searchLocation").val();
				if(q != "")
				{
					if($('#searchResults').css("display") == "none")
					{
						$("#searchResults").toggle();
					}
					//Send Request to OpenWeather
					w.getLocationsWithName(q, function(err, d){
						if(err){
							$("#searchResults").toggle();
							w.toggleElementAfterNSeconds("#searchError");
						}

						$.each(d.list,function(k,v){
							$("#searchResults").append(w.renderTemplate('searchResultsTemplate',v));
						});
										
					//Click on a result
					$(".foundLocations").click(function(){
						//Add id of clicked result to localStorage
						w.setItemInLocalStorage('foundLocation',$(this).attr('id'));
						//Add the Add button on the Detailpage
						w.setItemInLocalStorage('detailAddButton',true);
						//Change page
						//QJquery Mobile solution?
						window.location ='#detail';
						//Empty the Searchresults
						$("#searchResults").empty();
						$("#searchResults").toggle();
						$("#searchLocation").val("");
					});
				});
				}
				else
				{
					if($('#searchResults').css("display") != "none")
					{
						$("#searchResults").toggle();
					}
				}
		}
		});
	});
	
	$("#add").on('pagebeforeshow',function(){
		//Empty input field
		$("#searchResults").empty();
		if($('#searchResults').css("display") != "none")
		{
			$("#searchResults").toggle();
		}
		$("#searchLocation").val("");
		//Helper for Mainsearchfield to search for the same Location as in Main searchinput
		if(w.getItemFromLocalStorage('search') != false){
			var val = w.getItemFromLocalStorage('search')
			w.removeItemFromLocalStorage('search');
			$("#searchLocation").val(val);
			var e = jQuery.Event("keypress");
			e.which = 13;
			$("#searchLocation").trigger(e);
		}
	});
	$("#main").on('pagebeforeshow',function(){
		//Empty filterfield
		$("#filter-for-listview").val("");
		//Show hide buttons
    	$("#addLocation").show();
    	$("#locateMe").show();
    	$("#delete").hide();
    	$("#compareButton").hide();
    	//Set eventlistener for locationlist to redirect to Detailpage
		$('#locationList').on('click', 'div', function() {
			//If clicked entry is not No-Results div
  			if($(this).attr('id')!== "no-results"){
  				//Save id for detailpage
				localStorage.foundLocation = $(this).attr('id');
				//Change location
				window.location ='#detail';
			}
    	});
		//If locationslist is defined and not empty
		if(typeof(localStorage.locations) !== "undefined" && JSON.parse(localStorage.locations).length > 0) {
	    	var locations = JSON.parse(localStorage["locations"]);
	    	$("#locationList").empty();
	    	$.each(locations,function(k,v){
	    		var data = JSON.parse(localStorage[v]);
	    		//Render listitem
	    		$("#locationList").append(w.renderTemplate("mainListItem",data));
	    	});
	    	} else {
	    	//If the list is empty show this message
		    $("#locationList").html("<h1>No Locations</h1>");
		}
	});
	$("#detail").on("pagebeforeshow",function(){
		//Hide add button
		$("#detailAddButton").hide();
		$("#successMessage").hide();

		$("#detailAddButton").removeClass('ui-disabled');
		var found = w.getAndRemoveItemFromLocalStorage("foundLocation");
		var locationData = w.getItemFromLocalStorage(found);
		//If we don't find an entry for the location we load the data from the Openweather API
		console.log(locationData);
		if(locationData == false){
			w.getForecast({id:found},function(err,data){
				if(err){
					console.log(err);
				}
				console.log(data);
				//Save result for later usage
				w.setItemInLocalStorage(data.city.id,data);
				locationData = data;
				//Render Detailpage
				$("#cityDetail").html(w.renderTemplate("detailPage", locationData));
			});
		}else{
			//If we saved the data previously we can load the location from localStorage
				$("#cityDetail").html(w.renderTemplate("detailPage", locationData));
		}
		//If we want to save the location e.g. when we come from the Searchpage or LocateMe
		var addButton = w.getAndRemoveItemFromLocalStorage("detailAddButton");
		if(addButton != false){
			$("#detailAddButton").show();
			$("#detailAddButton").click(function(){
				//If Array is not set then set it
				w.setLocationInLocationList(locationData.city.id);
				
				//Disable Add button
				$("#detailAddButton").addClass('ui-disabled');
				
				w.toggleElementAfterNSeconds("#successMessage");

			});
		}
		
	});
  	//If entry in Mainpage is long pressed show the compare and delete buttons and replace the weathericon with checkboxes
    $("#locationList").on( "taphold", 'div', function(e){
    	 e.stopPropagation();
    	$("#addLocation").hide();
    	$("#locateMe").hide();
    	$("#delete").show();
    	$("#compareButton").show();
    	$(".listItemImage").replaceWith('<input class="checkbox-locations" type="checkbox" name="checkbox-0 ">');
    	//Check the checkbox from the pressed Item
    	$(this).children(".checkbox-locations").attr("checked","checked");
    	$("#locationList").off("click",'div');
    	//Set the eventlistener for the hole div to check the boxes
    	$("#locationList").on('click','div',function(){
    		$(this).children(".checkbox-locations").attr("checked",!$(this).children(".checkbox-locations").attr("checked"));
    	});
    	$("#compareButton").click(function(){
    		var selected = 0;
    		var a = Array();
    		$.each($(".checkbox-locations"),function(k,v){
    			if($(this).is(':checked')){
    				selected++;
    				//Push id to array for compare
    				a.push($(this).parent().attr('id'));
    			}
    		});
    		//Only if two Checkboxes are selected mache the compare
    		if(selected == 2){
    			localStorage.compare = JSON.stringify(a);
    			window.location = "#compare";
    		}
    	});
    	$("#delete").click(function(){
    		var a = Array();
    		$.each($(".checkbox-locations"),function(k,v){
    			if($(this).is(':checked')){
    				//Push id to array for delete
    				a.push(parseInt($(this).parent().attr('id')));
    			}
    		});
    		//confirm message to ask use if he want to delete
    		if (confirm('Are you sure you want to delete the selected Locations?')) {
			    		
			    		var b = JSON.parse(localStorage.locations);
			    		//Remove entries from localstorage
			    		b.remove(a);
			    		localStorage.locations = JSON.stringify(b);
			    		location.reload();
			    		return 0;
			}else{
						return 0;				
			}
    	});
    	return false;
    }); 
	//Get localpossition
    $("#locateMe").click(function(){
    	navigator.geolocation.getCurrentPosition(function(p){
    		//If we got the location send the data to the Openweather API
    		$.ajax({
				url: "http://api.openweathermap.org/data/2.5/forecast/daily?lat="+p.coords.latitude+"&lon="+p.coords.longitude+"&mode=json&units=metric&cnt=5&APPID="+api,
				dataType: 'JSON',
				method: "GET"
			}).done(function(d){
				localStorage[d.city.id] = JSON.stringify(d);
				localStorage.foundLocation = d.city.id;
				localStorage.detailAddButton = true;
				window.location = '#detail';
			});
    	}, function(e){
    		//If we dind't go a location show error message for 5 seconds
			$("#locationError").toggle();
    		
    		setTimeout(function(){
    			$("#locationError").toggle();
		   },5000);
    	});
    });
    //Handlebar helpers
    Handlebars.registerHelper('date', function(object) {
    	//Change Unixtimestamp to Day shortcuts
    	var d = new Date(object*1000);
    	var a = ['Mo','Tu','We','Th','Fr','Sa','Su'];
    	return new Handlebars.SafeString(a[d.getDay()]);
    });
    Handlebars.registerHelper('temp',function(object){
    	//Change Temp to Int and add a Celsius symbol
    	var t = Math.floor(object);
    	return new Handlebars.SafeString(t+"&deg;C");
    });
    Handlebars.registerHelper('country',function(object){
    	//Search the flag in the Flagsfolder
    	//If the country we get from the API is longer then 2 symbols we don't search
    	//Sometimes the return country is e.g. Switzerland even for Zurich CH is returned
    	var html = "";
    	if(object.length == 2)
    		html ="<img src='flags/"+object.toLowerCase()+".png'>";
    	return new Handlebars.SafeString(html);

    });
    //If we don't find any Locations local show message to search for the same location in gloaballist
    $("#locationList").on( "filterablefilter", function( event, ui ) {
        if ($(this).children(':visible').not('#no-results').length === 0) {
            $("#locationList").append('<li id="no-results">No Locations found.	Would you like to Search in the global Location list? <span id="yesSearch">Yes</span></li>').fadeIn(500);
        } else {
            $('#no-results').remove().fadeIn(250);
        }
    });
    //If the user clicks Yes to search in globallist we save the searchvalue and pass it to the add page
    $(document).on('click','#yesSearch',function(){
		var val = $("#filter-for-listview").val();
		localStorage.search = val;
		window.location = '#add';
	});
	//Render both compared Locations
	$("#compare").on('pagebeforeshow',function(){
		var selected = JSON.parse(localStorage.compare);
		delete localStorage.compare;
		$("#leftCity").html(w.renderTemplate("detailPage",localStorage[selected[0]]));
		$("#rightCity").html(w.renderTemplate("detailPage",localStorage[selected[1]]));
	});    
});
//Array prototype for removal of multiple Values in an Array
if (!Array.prototype.remove) {
  Array.prototype.remove = function(vals, all) {
    var i, removedItems = [];
    if (!Array.isArray(vals)) vals = [vals];
    for (var j=0;j<vals.length; j++) {
      if (all) {
        for(i = this.length; i--;){
          if (this[i] === vals[j]) removedItems.push(this.splice(i, 1));
        }
      }
      else {
        i = this.indexOf(vals[j]);
        if(i>-1) removedItems.push(this.splice(i, 1));
      }
    }
    return removedItems;
  };
}