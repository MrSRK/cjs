/**
 * Initialize angular module
 */
const app=angular.module("app",['ngCookies','app.cjs'])
/**
 * If login token exists: set Authorization token to all requests
 */
app.factory('httpRequestInterceptor',()=>
{
	return {
		request:config=>
		{
			const token=localStorage.getItem('token')
			if(typeof token!=undefined&&token)
				config.headers['Authorization']='Bearer '+token
			return config
		}
	}
})
/**
 *
 */
app.config(['$qProvider','$httpProvider',($qProvider,$httpProvider)=>
{
	$qProvider.errorOnUnhandledRejections(false)
	$httpProvider.interceptors.push('httpRequestInterceptor')
}])

/**
 * Main site default controller
 */
app.controller("page-handler",['$scope','$http','$cookies','$cjs',($scope,$http,$cookies,$cjs)=>
{
	try
	{
		const init_admin_menu=_=>
		{
			jsonWorken.get('/admin/api',null,(error,doc)=>
			{
				if(error)
					console.log(error)
				$scope.admin.data.menu=doc.data.data
				$scope.$apply()
			})
		}
		const catchWorken=new $cjs.workers.catch('../js/cache.service-worker.js',{url:"/json/manifest.json"});
		const jsonWorken=new $cjs.workers.json('../js/xhr.json.web-worker.js',$cookies.get('XSRF-TOKEN'));

		$scope.admin={}
		$scope.admin.data={}
		$scope.admin.init={}
		$scope.admin.init.menu=init_admin_menu
	}
	catch(error)
	{
		console.log('WE HAVE ERROR')
		console.log(error)
	}
}])