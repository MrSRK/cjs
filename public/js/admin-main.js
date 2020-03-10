/**
 * GLOBAL CONST
 */
const MAX_WORKER_LOAD=5
/**
 * Initialize angular module
 */
const app=angular.module("app",['ngCookies','app.cjs'])
/**
 * Main site default controller
 */
app.controller("page-handler",['$scope','$http','$cookies','$cjs',($scope,$http,$cookies,$cjs)=>
{
	try
	{
		const authCheck=_=>
		{
			const uToken=localStorage.getItem('user-token')
			if(!uToken)
				return false
			return picWorker().post('/admin/api/administrator/token',{userToken:uToken},(error,doc)=>
			{
				if(error)
					return false
				if(!doc.status)
					return false
				if(!doc.token)
					return false
				localStorage.setItem('token',doc.token)
				//window.location.href=window.location.href
				return true
			})
		}
		const init_admin_menu=_=>
		{
			return picWorker().get('/admin/api',null,(error,doc)=>
			{
				if(error)
					return console.log(error)
				if(!doc.status)
					return authCheck()
				$scope.admin.data.menu=doc
				$scope.$apply()
			})
		}
		const workers=[]
		const picWorker=_=>
		{
			const token=localStorage.getItem('token')
			if(workers.length==0)
			{
				workers[0]=new $cjs.workers.json('../js/xhr.json.web-worker.js?worker='+0,$cookies.get('XSRF-TOKEN'))
				workers[0].setToken(token)
				return workers[0]
			}
			for(i=0;i<workers.length;i++)
				if(workers[i].load<MAX_WORKER_LOAD)
				{
					workers[i].setToken(token)
					return workers[i]
				}
			workers[workers.length]=new $cjs.workers.json('../js/xhr.json.web-worker.js?worker='+i,$cookies.get('XSRF-TOKEN'))
			workers[workers.length-1].setToken(token)
			return workers[workers.length-1]
		}
		// Auth
		const admin_signIn=_=>
		{
			const args={
				signIn:true,
				data:{
					email:$scope.admin.auth.email,
					password:$scope.admin.auth.password
				}
			}
			return picWorker().post('/admin/api/administrator/authentication',args,(error,doc)=>
			{
				if(error)
				{
					$scope.admin.auth.error=error
					$scope.$apply()
					return  false
				}
				if(error||!doc.status)
				{
					$scope.admin.auth.error=doc.error
					$scope.$apply()
					return  false
				}
				localStorage.setItem('user-token',doc.token)
				window.location.href="/admin"
				return true
			})
		}
		$scope.admin={}
		$scope.admin.auth={}
		$scope.admin.auth.signIn=admin_signIn
		
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