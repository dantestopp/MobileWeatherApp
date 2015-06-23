$(document).ready(function(){
	//Startpage
 	window.location.hash = "main";
 	//Load Handlebarstemplate
	var source   = $("#mainListItem").html();
	var mainListItem = Handlebars.compile(source);
	source = $("#detailPage").html();
	var detailPage = Handlebars.compile(source);
	var leftCompare = Handlebars.compile(source);
	var rightCompare = Handlebars.compile(source);
	source = $("#searchResultsTemplate").html();
	var searchResults = Handlebars.compile(source);
	//OpenWeatherApi Key
	var api = "c7d8ac7641d0dd28540a2ec9fc2eb571";


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
					$.ajax({
						url:"http://api.openweathermap.org/data/2.5/find?q="+encodeURIComponent(q)+"&type=like&mode=json&APPID="+api,
						dataType: "JSON",
						method: "GET"
					}).done(function(d){
						if(d.list.length == 0){
							$("#searchResults").toggle();
							//Show error for 5 seconds
							$("#searchError").toggle();
							setTimeout(function(){
				    			$("#searchError").toggle();
						   },5000);
							return 0;
						}
						//Render each result with Template
						$.each(d.list,function(k,v){
							$("#searchResults").append(searchResults(v));
						});
						//Click on a result
						$(".foundLocations").click(function(){
							//Add id of clicked result to localStorage
							localStorage.foundLocation = $(this).attr('id');
							//Add the Add button on the Detailpage
							localStorage.detailAddButton = true;
							//Change page
							window.location ='#detail';
							//Empty the Searchresults
							$("#searchResults").empty();
							$("#searchResults").toggle();
							$("#searchLocation").val("");
						});
					}).error(function(err){
						$("#searchResults").toggle();
						//Show error message for 5 seconds
						$("#searchError").toggle();
							setTimeout(function(){
				    			$("#searchError").toggle();
						   },5000);
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
		if(typeof(localStorage.search) !== "undefined"){
			var val = localStorage.search;
			delete localStorage.search;
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
	    		$("#locationList").append(mainListItem(data));
	    	});
	    	} else {
	    	//If the list is empty show this message
		    $("#locationList").html("<h1>No Locations</h1>");
		}
	});
	$("#detail").on("pagebeforeshow",function(){
		//Hide add button
		$("#detailAddButton").hide();
		$("#detailAddButton").removeClass('ui-disabled');
		var data;
		var fL = localStorage.foundLocation;
		delete localStorage.foundLocation;
		//If we don't find an entry for the location we load the data from the Openweather API
		if(typeof(localStorage[fL]) === "undefined"){
			$.ajax({
				url: "http://api.openweathermap.org/data/2.5/forecast/daily?id="+fL+"&mode=json&units=metric&cnt=5&APPID="+api,
				dataType: 'JSON',
				method: "GET"
			}).done(function(d){
				//Save result for later usage
				localStorage[d.city.id] = JSON.stringify(d);
				data = d;
				//Render Detailpage
				$("#cityDetail").html(detailPage(data));
			});
		}else{
			//If we saved the data previously we can load the location from localStorage
				data = JSON.parse(localStorage[fL]);
				$("#cityDetail").html(detailPage(data));
		}
		//If we want to save the location e.g. when we come from the Searchpage or LocateMe
		if(localStorage.detailAddButton){
			delete localStorage.detailAddButton;
			$("#detailAddButton").show();
			$("#detailAddButton").click(function(){
				//If Array is not set then set it
				if(typeof(localStorage.locations) === "undefined" || localStorage.locations.length <= 0)
					localStorage.locations = JSON.stringify(new Array());
				var j = JSON.parse(localStorage.locations);
				j.push(data.city.id);
				//Delete same Locations out of Array
				j = $.unique(j);
				localStorage.locations = JSON.stringify(j);
				//Disable Add button
				$("#detailAddButton").addClass('ui-disabled');
    			
				$("#alert").html("<div id='successMessage' class='success success-style'>Location saved successfull</div>");
				//Show successMessage for 5 seconds
				setTimeout(function(){
					$("#successMessage").remove();
				},5000);
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
		$("#leftCity").html(leftCompare(JSON.parse(localStorage[selected[0]])));
		$("#rightCity").html(rightCompare(JSON.parse(localStorage[selected[1]])));
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