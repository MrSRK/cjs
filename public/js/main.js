/**
 * Initialize angular module
 */
const app=angular.module("app",[])
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
app.controller("page-handler",['$scope','$http','$interval',($scope,$http,$interval)=>
{
     
}])