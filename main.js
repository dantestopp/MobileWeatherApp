$("#add").ready(function(){
	$("#searchLocation").keypress(function(e) {
		 if(e.which == 13) {
			var q = $("#searchLocation").val();
			$.ajax({
				url:"http://api.openweathermap.org/data/2.5/find?q="+q+"&type=like&mode=json&APPID=c7d8ac7641d0dd28540a2ec9fc2eb571",
				dataType: "JSON",
				method: "GET"
			}).done(function(d){
				$.each(d.list,function(k,v){
					$("#searchResults").append("<li>"+v.name+"("+v.sys.country+")</li>");
				});
			});
	}
	});
});

