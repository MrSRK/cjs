/**
 * Initialize angular module
 */
const app=angular.module("app",['ngCookies','app.cjs'])
/**
 * Main site default controller
 */
app.controller("page-handler",['$scope','$cookies','$cjs',($scope,$cookies,$cjs)=>
{
	try
	{
		const page_textMaxLength=(length,text,end)=>
		{
			if(text.length<length)
				return text
			return text.substring(0,length)+end
		}
		const page_breadcrumb=_id=>
		{
			try
			{
				return picWorker((error,worker)=>
				{
					if(error)
						return console.log(error)
					return worker.get('/api/navigation/'+_id,null,(error,doc)=>
					{
						if(error)
							return console.log(error)
						if(!storage_set('page-breadcrumb',doc.doc,false))
							throw Error('Error on adding data to storage')
						return true
					})
				})
			}
			catch(error)
			{
				console.log(error)
			}
		}
		const page_list=(model,parent_navigation)=>
		{
			try
			{
				return picWorker((error,worker)=>
				{
					if(error)
						return console.log(error)
					return worker.post('/api/'+model,{where:{parent_navigation:parent_navigation},order:"order"},(error,doc)=>
					{
						if(error)
							return console.log(error)
						if(!storage_set('page-list-'+model,doc.doc,false))
							throw Error('Error on adding data to storage')
						return true
					})
				})
			}
			catch(error)
			{
				console.log(error)
			}
		}
		const init_model=model=>
		{
			$scope.model=model
		}
		const init_navigation=_=>
		{
			try
			{
				if(!storage_exist('navigation'))
					return picWorker((error,worker)=>
					{
						if(error)
							return console.log(error)
						return worker.post('/api/navigation',{order:"order"},(error,doc)=>
						{
							if(error)
								return console.log(error)
							if(!storage_set('navigation',doc.doc))
								throw Error('Error on seting data to storage')
							return true
						})
					})
			}
			catch(error)
			{
				console.log(error)
				return false
			}
		}
		/*
		 	#### Storage Functions ####
		*/
		const storage_set=(location,data,save=true)=>
		{
			try
			{
				$scope.storage.data[location]=data
				$scope.$apply()
				let name='storage-'+($scope.storage.version||0)
				if(save)
					sessionStorage.setItem(name,JSON.stringify($scope.storage.data))
				return true
			}
			catch(error)
			{
				console.log(error)
				return false
			}
		}
		const storage_exist=location=>
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
		const storage_get=location=>
		{
			try
			{
				let name='storage-'+($scope.storage.version||0)
				if(storage_exist(location))
					return $scope.storage.data[location]
				let storage=JSON.parse(sessionStorage.getItem(name)||{})
				if(storage[location])
				{
					if(!$scope.storage.data)
						$scope.storage.data={}
					$scope.storage.data[location]=storage[location]
					return storage[location]
				}
				//console.log(`data ${location} not exist`)
			}
			catch(error)
			{
				console.log(error)
				return null
			}
		}
		const storage_load=_=>
		{
			try
			{
				let name='storage-'+($scope.storage.version||0)
				if(!sessionStorage.getItem(name))
					sessionStorage.setItem(name,JSON.stringify({}))
				$scope.storage.data=JSON.parse(sessionStorage.getItem(name)||{})
				return true
			}
			catch(error)
			{
				console.log(error)
				return false
			}
		}
		/*
			#### Web Worker functions ####
		*/
		let workers=[]
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
		// Initialize scope (page) objects / functions
		$scope.page={}
		$scope.page.list=page_list
		$scope.page.breadcrumb=page_breadcrumb
		$scope.page.textMaxLength=page_textMaxLength
		// Initialize scope (user) objects / functions
		$scope.user={}
		$scope.user.init={}
		$scope.user.init.model=init_model
		$scope.user.init.navigation=init_navigation
		$scope.model=null
		// Initialize scope (storage) objects / functions
		$scope.storage={}
		$scope.storage.version='beta'
		$scope.storage.data={}
		$scope.storage.get=storage_get
		$scope.storage.exist=storage_exist
		// Load Stortage data from session storage to scope storage
		storage_load()
	}
	catch(error)
	{
		console.log(error)
	}
}])