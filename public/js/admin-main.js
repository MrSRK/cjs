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
		const admin_setModel=model=>
		{
			$scope.model=model
		}
		const admin_status_single=(index,status)=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				if(index>=0)
				{
					$scope.page.status={index:index,_id:$scope.page.data[index]._id}
				}
				if(!$scope.page.status)
					return console.log('Status: _id not exist')
				const url='/admin/api/'+model+'/findByIdAndUpdate/'+$scope.page.status._id
				const active=status||!$scope.page.data[$scope.page.status.index].active
				const args={data:{active:active}}
				return worker.patch(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(admin_status_single)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
					$scope.page.data[$scope.page.status.index]=doc.doc
					delete $scope.page.status
					$scope.$apply()
				})
			})
		}
		const admin_remove_single=index=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
				return picWorker((error,worker)=>
				{
					if(error)
						return console.log(error)
					if(index>=0)
						$scope.page.remove={index:index,_id:$scope.page.data[index]._id}
					if(!$scope.page.remove)
						return console.log('Remove: _id not exist')
					const url='/admin/api/'+model+'/findByIdAndDelete/'+$scope.page.remove._id
					const args={}
					let safe=true
					if(index)
						safe=confirm('Delete this row?')
					if(safe)
						return worker.delete(url,args,(error,doc)=>
						{
							if(error)
								$scope.error=error
							if(doc.auth===false)
								return token_renew(admin_remove_single)
							if(!doc.status)
								$scope.error=new Error(doc.message||"Unknown Error")
							$scope.page.data.splice($scope.page.remove.index,1)
							delete $scope.page.remove
							$scope.$apply()
						})
				})
		}
		const admin_table=_=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				const url='/admin/api/'+model+'/find'
				const args={}
				return worker.get(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(admin_table)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
					$scope.page.data=doc.doc

					let pages=Math.ceil(doc.doc.length/$scope.page.limit)
					$scope.page.pages=[]
					for(var i=0;i<pages;i++)
						$scope.page.pages.push({bigin:i*$scope.page.limit,label:(i+1)})
					$scope.page.bigin=$scope.page.pages[0]
					if($scope.page.pages.length>1)
						$scope.page.next=1
					$scope.$apply()
				})
			})
		}
		// Authentication Sign Out
		const admin_signOut=_=>
		{
			localStorage.removeItem('user')
			localStorage.removeItem('token')
			localStorage.removeItem('user-token')
			window.location.href=window.location.href
			return true
		}
		// Authentication Sign In
		const admin_signIn=_=>
		{
			const args={
				signIn:true,
				data:{
					email:$scope.admin.auth.email,
					password:$scope.admin.auth.password
				}
			}
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				return worker.post('/admin/api/administrator/authentication',args,(error,doc)=>
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
					$scope.admin.user=
					{
						email:doc.doc.email,
						name:doc.doc.name
					}
					localStorage.setItem('user',JSON.stringify($scope.admin.user))
					window.location.href="/admin"
					return true
				})
			})
		}
		// Initialize Administrator menu
		const init_admin_menu=_=>
		{
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				return worker.get('/admin/api',null,(error,doc)=>
				{
					if(error)
						return console.log(error)
					if(doc.auth===false)
						return token_renew(init_admin_menu)
					$scope.admin.data.menu=doc.data
					$scope.$apply()
					return true
				})
			})
		}
		// Renew token if user token exist and re call fanction
		const token_renew=call=>
		{
			const uToken=localStorage.getItem('user-token')
			if(!uToken)
				return null
			localStorage.removeItem('token')
			return call()
		}
		// workers array
		let workers=[]
		// pic or create new worker (spread load to workers)
		const picWorker=next=>
		{
			const uToken=localStorage.getItem('user-token')
			const token=localStorage.getItem('token')
			let worker=null
			if(workers.length==0)
			{
				worker=new $cjs.workers.json('../js/xhr.json.web-worker.js',$cookies.get('XSRF-TOKEN'))
				workers[workers.length]=worker
			}
			else
				for(i=0;i<workers.length;i++)
				{
					if(workers[i].load<1)
					{
						worker=workers[i]
						break
					}
				}
			if(!worker)
			{
				worker=new $cjs.workers.json('../js/xhr.json.web-worker.js',$cookies.get('XSRF-TOKEN'))
				workers[workers.length]=worker
			}
			if(!uToken)
				return next(null,worker)
			if(token)
			{
				worker.setToken(token)
				return next(null,worker)
			}
			return worker.post('/admin/api/administrator/token',{userToken:uToken},(error,doc)=>
			{
				if(error)
					return next(error,worker)
				if(!doc.status)
					return next({name:'Error',message:doc.message},worker)
				if(!doc.token)
					return next(new Error('No token return'),worker)
				localStorage.setItem('token',doc.token)
				worker.setToken(doc.token)
				return next(null,worker)
			})
		}
		const page_order=colName=>
		{
			if($scope.page.order==colName)
				$scope.page.order='-'+colName
			else
				$scope.page.order=colName
		}
		const page_next=_=>
		{
			const page=$scope.page.next||0
			return page_goto(page)
		}
		const page_previous=_=>
		{
			const page=$scope.page.previous-1||0
			return page_goto(page)
		}
		const page_goto=page=>
		{
			if($scope.page.pages.length>=page)
			{
				$scope.page.bigin=$scope.page.pages[page]
				$scope.page.next=null
				$scope.page.previous=null
				if($scope.page.pages.length>page+1)
					$scope.page.next=page+1
				if(page>0)
					$scope.page.previous=page
			}
		}
		$scope.page={}
		$scope.page.data=[]
		$scope.page.limit=20
		$scope.page.bigin={bigin:0}
		$scope.page.pages=[]
		$scope.page.next=null
		$scope.page.previous=null
		$scope.page.order='_id'
		$scope.page.select={}
		$scope.page.error={}
		$scope.page.go2next=page_next
		$scope.page.go2previous=page_previous
		$scope.page.pageOrder=page_order

		$scope.admin={}
		$scope.admin.auth={}
		$scope.admin.auth.signIn=admin_signIn
		$scope.admin.auth.signOut=admin_signOut
		$scope.admin.data={}
		$scope.admin.init={}
		$scope.admin.init.menu=init_admin_menu
		$scope.admin.model=admin_setModel
		$scope.admin.table=admin_table
		$scope.admin.remove=admin_remove_single
		$scope.admin.status=admin_status_single
		
		
		$scope.model=null
		/**
		 * Load login user data to scope (if any)
		 */
		const user=localStorage.getItem('user')
		if(user)
			$scope.admin.user=JSON.parse(user)
	}
	catch(error)
	{
		console.log(error)
	}
}])