/**
 * Initialize angular module
 */
const app=angular.module("app",['ngCookies','$cjs'])
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
app.controller("page-handler",['$scope','$http','$interval','$cookies','$cjs',($scope,$http,$interval,$cookies,$cjs)=>
{
    try
    {
        const init_admin_menu=_=>
        {
            jsonWorken.get('/admin/api',null,(error,doc)=>
            {
                if(error)
                    console.log(error)
                $scope.admin.data.menu=doc.data
            })
        }



        const jsonWorken=$cjs.workers.json;
        jsonWorken.register('js/xhr.json.web-worker.js',$cookies.get('XSRF-TOKEN'),(error,done)=>
        {
            if(error)
                console.log(error)
        })
        $scope.admin={}
        $scope.admin.data={}
        $scope.admin.init={}
        $scope.admin.init.menu=init_admin_menu

        init_admin_menu()
    }
    catch(error)
    {
        console.log(error)
    }
}])