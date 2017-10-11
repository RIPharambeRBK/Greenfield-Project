angular.module('myapp')
.component('rec',{
	controller:function(){
		this.title = this.recomendedMovie.title
		this.poster = this.recomendedMovie.poster
		this.date = this.recomendedMovie.date
},
	bindings:{
		recomendedMovie:'<'
	},
  templateUrl: 'public/templates/rec.html'

});
