$(document).ready(function(){
	var source   = $("#mainListItem").html();
	var mainListItem = Handlebars.compile(source);
	source = $("#detailPage").html();
	var detailPage = Handlebars.compile(source);
	var api = "c7d8ac7641d0dd28540a2ec9fc2eb571";
	$("#add").ready(function(){
		$("#searchLocation").keypress(function(e) {
			 if(e.which == 13) {
				var q = $("#searchLocation").val();
				$.ajax({
					url:"http://api.openweathermap.org/data/2.5/find?q="+q+"&type=like&mode=json&APPID="+api,
					dataType: "JSON",
					method: "GET"
				}).done(function(d){
					console.log(d);
					$.each(d.list,function(k,v){
						$("#searchResults").append("<li class='foundLocations' id='"+v.id+"'>"+v.name+"("+v.sys.country+")</li>");
					});
					$(".foundLocations").click(function(){
						localStorage.foundLocation = $(this).attr('id');
						localStorage.detailAddButton = true;
						window.location ='#detail';
					});
				});
		}
		});
	});
	$("#main").ready(function(){
		if(typeof(localStorage["locations"]) !== "undefined") {
	    	var locations = JSON.parse(localStorage["locations"]);
	    	$.each(locations,function(k,v){
	    		var data = JSON.parse(localStorage[v]);
	    		console.log(data);
	    		$("#locationList").append(mainListItem(data));
	    	});
	    } else {
		    $("#locationList").html("<h1>No Locations</h1>");
		}
	});
	$("#detail").on("pagebeforeshow",function(){

		var data;
		//If Temp saved and not older than 30 min load from localstorage
		//If not load the detail temp and save it to the localStorage
		var fL = localStorage['foundLocation'];
		delete localStorage['foundLocation'];
		if(localStorage[fL] == null){
			console.log("Ajax");
			$.ajax({
				url: "http://api.openweathermap.org/data/2.5/forecast/daily?id="+fL+"&mode=json&units=metric&cnt=5&APPID="+api,
				dataType: 'JSON',
				method: "GET"
			}).done(function(d){
				localStorage[d.city.id] = JSON.stringify(d);
				data = d;
			});
		}else{
				data = JSON.parse(localStorage[fL]);
		}

		if(localStorage.detailAddButton){
			delete localStorage.detailAddButton;
			$("#detailheader").append('<a id="detailAddButton" class="ui-btn ui-shadow ui-corner-all ui-btn-icon-right ui-icon-plus ui-btn-icon-notext"></a>');
			$("#detailAddButton").click(function(){
				if(typeof(localStorage.locations) === "undefined" || localStorage.locations.length <= 0)
					localStorage.locations = JSON.stringify(new Array());
				var j = JSON.parse(localStorage.locations);
				j.push(data.city.id);
				j = $.unique(j);
				localStorage.locations = JSON.stringify(j);
			});
		}
		
		console.log(data);
		$("#detail > .ui-content").html(detailPage(data));
	});
  	$('#locationList').on('click', 'div', function() {
		console.log("click");
		localStorage.foundLocation = $(this).attr('id');
		window.location ='#detail';
    });
    $("#locationList").on( "taphold", 'div', function(e){
    	e.preventDefault();
    	$("#addLocation").replaceWith("<button class='ui-btn ui-icon-delete ui-btn-icon-left ui-btn-icon-notext'></button>");
    	return false;
    }); 
    $("#locateMe").click(function(){
    	navigator.geolocation.getCurrentPosition(function(p){
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
    		alert(e);
    	});
    });

});