angular.module('watched')
.component('watchentry',{
	bindings:{
		movie:'<'
	},
	templateUrl: 'public/templates/watchentry.html'
})