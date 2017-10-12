//............................................maisaa..........
angular.module('myapp',[])
.component('app',{
	controller:function(){ 
		var x=this;
		$.ajax({
			async:false,
			url: "https://api.themoviedb.org/3/movie/now_playing?api_key=8081cb4893843ff570504c531dd99fe9&language=en-US&page=1",
			cache: false,
			dataType: 'json',
			success: function(data){
				body = data
				  	var theaters = [];
				  	//"http://image.tmdb.org/t/p/w185/"+body.results.
			    	RandIndex = Math.ceil(Math.random()*15)
				    for (var i = RandIndex; i < RandIndex + 4; i++) {
				    	var object = {};
				    	object.poster = "http://image.tmdb.org/t/p/w185/"+ body.results[i].poster_path
				    	object.title = body.results[i].original_title
				    	object.date = body.results[i].release_date
				    	object.genre = body.results[i].genre
				    	theaters.push(object)
				    }
				    x.list = theaters

			},
			error: function(){
				console.log("error")
			}

		})
		this.user=''
		 $.ajax({
              		async:false,
              		url: "http://127.0.0.1:8080/session",
              		cache: false,
              		dataType: 'json',
              		success: function(user){
              			//console.log(user);
              			x.user=user;
              		}
              	});
		//console.log(this.user)
		this.trailer=[]; 
		this.movie=[];
		this.id=undefined;
		this.change=function(){
			//convert the name to id
			var text=this.input.val.value
			text=text.toLowerCase();
			for (var i=0;i<window.convertor.length;i++){
				titel=window.convertor[i].original_title.toLowerCase()
				if(text==titel){
					x.id=window.convertor[i].id;
					break;
				}
			}
			console.log(text)
			$.ajax({
				async:false,
				url: "https://api.themoviedb.org/3/movie/"+x.id+"?api_key=5d2afcf0b3a09621c2e2a3961a8a7024&language=en-US",
				cache: false,
				dataType: 'json',
				success: function(data){
              	x.movie[0]=data
              	console.log(x.movie)
              	$.ajax({
              		async:false,
              		url: "https://api.themoviedb.org/3/movie/"+x.id+"/videos?api_key=5d2afcf0b3a09621c2e2a3961a8a7024&language=en-US",
              		cache: false,
              		dataType: 'json',
              		success: function(data2){
              			x.trailer[0]=data2
              			console.log(x.trailer)
              		}
              	})
              	////////////hiba////////////////////////////////
              	$.ajax({
				async:false,
				url: "https://api.themoviedb.org/3/movie/"+x.id+"/recommendations?api_key=8081cb4893843ff570504c531dd99fe9&language=en-US&page=1",
				cache: false,
				dataType: 'json',
				success: function(data){	    	
					RandIndex = Math.ceil(Math.random()*20)
					body = data.results[RandIndex]
			    	var recomendedMovie = {};
			    	recomendedMovie.poster = "http://image.tmdb.org/t/p/w185/"+ body.poster_path
			    	recomendedMovie.title = body.original_title
			    	recomendedMovie.date = body.release_date
					x.recomendedMovie = recomendedMovie

				},
				error: function(){
					console.log("error")
				}

				})
		        console.log("suggested movie : ", x.recomendedMovie)
		        /////////////hiba/////////////////////////////
              }
          })

			
		}
	},	
	templateUrl:'public/templates/app.html'
});

//............................................maisaa..........