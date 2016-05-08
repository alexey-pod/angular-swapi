(function() {
    'use strict';

	var app = angular.module('app', 
		[
			'ui.router',
			'ngResource',
			'ne.swapi',
			'trNgGrid'
		]
	);
	app.constant('baseUrl', "http://swapi.co/api");
			
	app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
		
			$urlRouterProvider.otherwise(function($injector) {
				var $state = $injector.get('$state');
				$state.go('404', null, {
					location: false
				});
			});
			 
			//$urlRouterProvider.otherwise("/404/");
		  
			$locationProvider.html5Mode(true).hashPrefix('!');
		  
			$stateProvider
			.state('index', {
				url: "/",
				templateUrl: "/views/index.tpl",
				controller: function(pageFactory){
					
					pageFactory.title('Main page');
					pageFactory.id('main');
					pageFactory.page_load(false);
					
				}
			})
			.state('film_array_page', {
				url: "/films/",
				templateUrl: "/views/item_array.tpl",
				resolve:{
					film_array:  function(swapi, pageFactory){
						pageFactory.page_load(true);
						return swapi.films.all();
					}
				},
				controller: function($scope, film_array, pageFactory){
					$scope.items=film_array.results;
					$scope.fields=['title', 'release_date', 'director', 'producer'];
					pageFactory.title('Films');
					pageFactory.id('films');
					pageFactory.page_load(false);
				}
			})
			.state('people_array_page', {
				url: "/people/",
				templateUrl: "/views/item_array.tpl",
				resolve: {
					people_array: function(swapi, pageFactory) {
						pageFactory.page_load(true);
						return swapi.people.all();
					}
				},
				controller: function($scope, people_array, pageFactory){
					$scope.items=people_array.results;
					$scope.fields=['name', 'height', 'mass', 'hair_color', 'skin_color', 'eye_color', 'birth_year', 'gender'];
					pageFactory.title('People');
					pageFactory.id('people');
					pageFactory.page_load(false);
				}
			})
			.state('species_array_page', {
				url: "/species/",
				templateUrl: "/views/item_array.tpl",
				resolve: {
					species_array: function(swapi, pageFactory) {
						pageFactory.page_load(true);
						return swapi.species.all();
					}
				},
				controller: function($scope, species_array, pageFactory){
					$scope.items=species_array.results;
					$scope.fields=['name', 'classification', 'designation', 'average_height', 'skin_colors', 'hair_colors', 'eye_colors', 'average_lifespan', 'language'];
					pageFactory.title('Species');
					pageFactory.id('species');
					pageFactory.page_load(false);
				}
			})
			.state('planet_array_page', {
				url: "/planets/",
				templateUrl: "/views/item_array.tpl",
				resolve: {
					planet_array: function(swapi, pageFactory) {
						pageFactory.page_load(true);
						return swapi.planets.all();
					}
				},
				controller: function($scope, planet_array, pageFactory){
					$scope.items=planet_array.results;
					$scope.fields=['name', 'rotation_period', 'orbital_period', 'diameter', 'climate', 'gravity', 'terrain', 'surface_water', 'population'];
					pageFactory.title('Planets');
					pageFactory.id('planets');
					pageFactory.page_load(false);
				}
			})
			.state('starship_array_page', {
				url: "/starships/",
				templateUrl: "/views/item_array.tpl",
				resolve: {
					starship_array: function(swapi, pageFactory) {
						pageFactory.page_load(true);
						return swapi.starships.all();
					}
				},
				controller: function($scope, starship_array, pageFactory){
					$scope.items=starship_array.results;
					$scope.fields=['name', 'model', 'manufacturer', 'cost_in_credits', 'length', 'crew', 'passengers', 'hyperdrive_rating', 'MGLT', 'starship_class'];
					pageFactory.title('Starships');
					pageFactory.id('starships');
					pageFactory.page_load(false);
				}
			})
			.state('vehicle_array_page', {
				url: "/vehicles/",
				templateUrl: "/views/item_array.tpl",
				resolve: {
					vehicle_array: function(swapi, pageFactory) {
						pageFactory.page_load(true);
						return swapi.vehicles.all();
					}
				},
				controller: function($scope, vehicle_array, pageFactory){
					$scope.items=vehicle_array.results;
					$scope.fields=['name', 'model', 'manufacturer', 'cost_in_credits', 'length', 'max_atmosphering_speed', 'crew', 'passengers', 'cargo_capacity', 'consumables', 'vehicle_class'];
					pageFactory.title('Vehicles');
					pageFactory.id('vehicles');
					pageFactory.page_load(false);
				}
			})
			.state('404', {
				url: "/404/",
				template: [
					"<div class='page_error'>",
						"<h1>404 Страница не найдена</h1>",
						"<div>",
							"<p>К сожалению запрошенная страница не найдена на сервере.</p>",
							"<p>Вернуться на <a href='/'>главную</a></p>",
						"</div>",
					"</div>",
				].join(''),
				controller: function(pageFactory){
					pageFactory.title('404 Страница не найдена');
					pageFactory.page_load(false);
				}
			});
	});

	// controller
	app.controller('mainCtrl', function ($scope, pageFactory) {
		$scope.page = pageFactory;
	});

	//Factory
	app.factory('pageFactory', function () {
		
		var page = {};
		page.title = 'App';
		page.id='';
		page.page_array=[
			{id:'main',		name:'Main page',	url: '/'},
			{id:'films',	name:'Films',		url: '/films/'},
			{id:'species',	name:'Species',		url: '/species/'},
			{id:'people',	name:'People',		url: '/people/'},
			{id:'planets',	name:'Planets',		url: '/planets/'},
			{id:'starships',name:'Starships',	url: '/starships/'},
			{id:'vehicles',	name:'Vehicles',	url: '/vehicles/'}
		];
		page.page_load=true;
		
		
		return {
			title: function(value) { 
				if(value===undefined){
					return page.title; 	
				}
				else{
					page.title = value;	
				}
			},
			id: function(value) {
				if(value===undefined){
					return page.id;
				}
				else{
					page.id = value;	
				}
			},
			page_array: function(){
				return page.page_array;
			},
			page_load: function(value){
				if(value===undefined){
					return page.page_load;
				}
				else{
					page.page_load=value;
				}
			}
		};
	});

})();