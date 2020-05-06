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
		const init_setModel=model=>
		{
			$scope.model=model
		}
		// Initialize Administrator menu
		const init_navigation=_=>
		{
			if(!$scope.storage.exist('navigation'))
				return picWorker((error,worker)=>
				{
					if(error)
						return console.log(error)
					return worker.get('/api/navigation',null,(error,doc)=>
					{
						if(error)
							return console.log(error)
						$scope.storage.set('navigation',doc.doc)
						return true
					})
				})
		}
		// workers array
		let workers=[]
		$scope.storage={}
		$scope.storage.data={}
		$scope.storage.set=(location,data)=>
		{
			try
			{
				$scope.storage.data[location]=data
				$scope.$apply()
				sessionStorage.setItem('storage',JSON.stringify($scope.storage.data))
				return true
			}
			catch(error)
			{
				console.log(error)
				return false
			}
		}
		$scope.storage.exist=location=>
		{
			try
			{
				return $scope.storage.data[location]?true:false
			}
			catch(error)
			{
				console.log(error)
				return false
			}
		}
		$scope.storage.get=location=>
		{
			try
			{
				if($scope.storage.exist(location))
					return $scope.storage.data[location]
				console.log(`data ${location} not exist`)
				return null
			}
			catch(error)
			{
				console.log(error)
				return null
			}
		}
		$scope.storage.load=_=>
		{
			try
			{
				if(!sessionStorage.getItem('storage'))
					$scope.storage.data={}
				else
					$scope.storage.data=JSON.parse(sessionStorage.getItem('storage'))
				return true
			}
			catch(error)
			{
				console.log(error)
				return false
			}
		}
		//Load exising storage for session storage
		$scope.storage.load()
		//Web Workerns
		const picWorker=next=>
		{
			let worker=null
			if(workers.length==0)
			{
				worker=new $cjs.workers.json('../js/xhr.json.web-worker.js',$cookies.get('XSRF-TOKEN'))
				workers[workers.length]=worker
			}
			else
				for(i=0;i<workers.length;i++)
					if(workers[i].load<1)
					{
						worker=workers[i]
						break
					}
			if(!worker)
			{
				worker=new $cjs.workers.json('../js/xhr.json.web-worker.js',$cookies.get('XSRF-TOKEN'))
				workers[workers.length]=worker
			}
			return next(null,worker)
		}
		$scope.user={}
		$scope.user.init={}
		$scope.user.init.navigation=init_navigation
		$scope.user.model=init_setModel
	}
	catch(error)
	{
		console.log(error)
	}
}])