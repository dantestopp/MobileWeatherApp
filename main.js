$(document).ready(function(){
 	window.location.hash = "main";
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
						$("#searchResults").append("<li class='foundLocations' id='"+v.id+"'><div>"+v.name+"</div> <img src='flags/"+v.sys.country+".png'></li>");
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
	$("#add").on('pagebeforeshow',function(){
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
		if(typeof(localStorage["locations"]) !== "undefined") {
	    	var locations = JSON.parse(localStorage["locations"]);
	    	$("#locationList").empty();
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
		$("#detailAddButton").hide();
		var data;
		var fL = localStorage['foundLocation'];
		delete localStorage['foundLocation'];
		if(typeof(localStorage[fL]) === "undefined"){
			$.ajax({
				url: "http://api.openweathermap.org/data/2.5/forecast/daily?id="+fL+"&mode=json&units=metric&cnt=5&APPID="+api,
				dataType: 'JSON',
				method: "GET"
			}).done(function(d){
				localStorage[d.city.id] = JSON.stringify(d);
				data = d;
				$("#detail > .ui-content").html(detailPage(data));
			});
		}else{
				data = JSON.parse(localStorage[fL]);
				$("#detail > .ui-content").html(detailPage(data));
		}

		if(localStorage.detailAddButton){
			delete localStorage.detailAddButton;
			$("#detailAddButton").show();
			$("#detailAddButton").click(function(){
				if(typeof(localStorage.locations) === "undefined" || localStorage.locations.length <= 0)
					localStorage.locations = JSON.stringify(new Array());
				var j = JSON.parse(localStorage.locations);
				j.push(data.city.id);
				j = $.unique(j);
				localStorage.locations = JSON.stringify(j);
			});
		}
		
	});
  	$('#locationList').on('click', 'div', function() {
  		if($(this).attr('id')!== "no-results"){
			localStorage.foundLocation = $(this).attr('id');
			window.location ='#detail';
		}
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
			$("#locationError").toggle();
    		
    		setTimeout(function(){
    			$("#locationError").toggle();
		   },5000);
    	});
    });

    Handlebars.registerHelper('date', function(object) {
    	var d = new Date(object*1000);
    	var a = ['Mo','Tu','We','Th','Fr','Sa','Su'];
    	return new Handlebars.SafeString(a[d.getDay()]);
    });
    Handlebars.registerHelper('temp',function(object){
    	return new Handlebars.SafeString(object+"&deg;C");
    });
    $("#locationList").on( "filterablefilter", function( event, ui ) {
        if ($(this).children(':visible').not('#no-results').length === 0) {
            $("#locationList").append('<li id="no-results">No Locations found.	Would you like to Search in the global Location list? <span id="yesSearch">Yes</span></li>').fadeIn(500);
        } else {
            $('#no-results').remove().fadeIn(250);
        }
    });
    $(document).on('click','#yesSearch',function(){
		var val = $("#filter-for-listview").val();
		localStorage.search = val;
		window.location = '#add';
	});    
});