(function() {
  
  var app = angular.module('CoolStuffStore', ['ngRoute']);
  
  app.config(['$routeProvider', function(router) {
    router.when('/registration', {
      templateUrl: 'view/registration.html',
      noPasswordRequired: true
    });
    router.when('/presentation', {
      templateUrl: 'view/presentation.html',
      noPasswordRequired: true
    });
    router.when('/dashboard', {
      templateUrl: 'view/dashboard.html'
    });
    //router.otherwise({redirectTo: '/presentation'});
  }]);
  
  app.controller('TokenController', ['$rootScope', '$location', function(scope, location) {
    var self = this;
    this.token = null;
    
    scope.$on('$routeChangeStart', function(event, args) {
      if (!args.$$route.noPasswordRequired)
        scope.$emit('checkSession');
    });
    
    scope.$on('checkSession', function(event, args) {
      self.token = localStorage.getItem('USER_STORED_TOKEN');
      
      if(self.token) {
        location.path('/dashboard');
      }
      else {
        location.path('/presentation');
      }
    });
    
    scope.$on('storeSession', function(event, args) {
      localStorage.setItem('USER_STORED_TOKEN', args.jwt);
      scope.$emit('checkSession');
    });
    
    scope.$on('clearSession', function(event, args) {
      localStorage.clear('USER_STORED_TOKEN');
      scope.$emit('checkSession');
    })
    
  }]);
  
  app.controller('UserController', ['$rootScope', '$http', '$location', function(scope, http, location) {
    this.user = {
      username: null,
      password: null,
      name: null,
      surname: null
    }
    
    this.doLogin = function() {
      if(!(this.user.username === 'pau' && this.user.password === 'pass'))
        return scope.$emit('logMessage', { title: 'Login Error', body: 'Wrong username or password' });
      
      http.get('fakedata/token.json', { username: this.username, password: this.password })
        .success(function(data, status) {
          scope.$emit('storeSession', data);
        })
        .error(function(data, status) {
          scope.$emit('logMessage', { title: 'Network Error', body: 'Unable to get the token' });
        });
    }
    
    this.doRegistration = function() {
      http.post('fakedata/user', this.user)
        .success(function(data, status) {
          scope.$emit('logMessage', { title: 'Registration successful', body: '' });
          scope.$emit('storeSession', data);
        })
        .error(function(data, status) {
          scope.$emit('logMessage', { title: 'Registration failed', body: 'Server gives error ' + status });
        });
    }
    
  }]);
  
  app.controller('LogController', ['$rootScope', function(scope) {
    var self = this;
    
    this.title = null;
    this.message = null;
    this.visible = false;
    
    scope.$on('logMessage', function (event, args) {
      console.log("[LOG]: " + args.title + " - " + args.body);
      self.title = args.title;
      self.message = args.body;
      self.visible = true;
    });
    
  }]);
  
  app.controller('ItemsController', ['$rootScope', '$http', function(scope, http) {
    var self = this;
    this.items = [];
    
    this.buy = function(index) {
      scope.$emit('addToCart', this.items[index]);
    }
    
    http.get('fakedata/list.json')
      .success(function(data) {
        self.items = data;
      })
      .error(function(data, status) {
        scope.$emit('logMessage', { title: 'Network Error', body: 'Unable to get the item list' });
      });
    
  }]);
  
  app.controller('CartController', ['$rootScope', function(scope) {
    var self = this;
    this.itemsToBuy = [];
    this.total = 0;
    
    this.remove = function(index) {
      var removed = this.itemsToBuy.splice(index, 1);
      this.total = this.total - removed[0].price;
    }
    
    this.checkOut = function() {
      console.log('here i am');
      this.itemsToBuy = [];
      this.total = this.total - this.total;
    }
    
    scope.$on('addToCart', function(event, args) {
      self.itemsToBuy.push(args);
      self.total = self.total + args.price;
    });
  }]);
  
  // To Be Fixed!
  app.run(['$rootScope', '$timeout', function(scope, to) {
    to(function(){
      scope.$emit('checkSession', {});
    }, 100);
  }]);
  
})();
