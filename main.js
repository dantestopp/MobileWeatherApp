$("#add").ready(function(){
	$("#searchLocation").keypress(function(e) {
		 if(e.which == 13) {
			var q = $("#searchLocation").val();
			$.ajax({
				url:"http://api.openweathermap.org/data/2.5/find?q="+q+"&type=like&mode=json&APPID=c7d8ac7641d0dd28540a2ec9fc2eb571",
				dataType: "JSON",
				method: "GET"
			}).done(function(d){
				console.log(d);
				$.each(d.list,function(k,v){
					$("#searchResults").append("<li class='foundLocations' id='"+v.id+"'>"+v.name+"("+v.sys.country+")</li>");
					localStorage[v.id] = v;
				});
				$(".foundLocations").click(function(){
					localStorage.foundLocation = $(this).attr('id');
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
    	$("#locationList").append("<li><h1>"+v.name+"</h1><h2>"+v.temp+"</h2></li>");
    	});
    } else {
	    $("#locationList").html("<h1>No Locations</h1>");
	}
});
$("#detail").ready(function(){
	//If Temp saved and not older than 30 min load from localstorage
	//If not load the detail temp and save it to the localStorage
	var location = localStorage[localStorage['foundLocation']];
	$("#locationId").html(location.name);
});
