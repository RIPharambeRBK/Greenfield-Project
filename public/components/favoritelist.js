//............................................maisaa..........
angular.module('favorite',[])
.component('favoritelist',{
	controller:function($scope){

		this.data=[];
		var x=this;
		$.ajax({
			async: false,
			url: "http://127.0.0.1:8080/favorite",
			cache: false,
			dataType: 'json',
			success: function(data){
				console.log(data)
				x.data=data
            }
        })

        // this.sort = function(){
        // 	this.data.sort(function(a,b){
        // 		return a.title -b.title;
        // 	})
        // 	$scope.$apply();
        // }
	},
	templateUrl:'public/templates/favoritelist.html'
});

//............................................maisaa..........



