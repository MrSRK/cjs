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
		const admin_new=_=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				const url='/api/'+model+'/schema/'
				const args={}
				return worker.get(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(admin_new)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
					$scope.page.schema=Object.keys(doc.schema.obj)
					$scope.$apply()
				})
			})
		}
		const admin_edit=_id=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				if(!_id)
					return console.log('Status: Index not set')
				const url='/admin/api/'+model+'/findById/'+_id
				const args={}
				return worker.get(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(admin_edit,_id)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
					$scope.page.record=doc.doc
					$scope.page.schema=Object.keys(doc.schema.obj)
					$scope.$apply()
				})
			})
		}
		const admin_status_single=(index)=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				if(!(index>=0))
					return console.log('Status: Index not set')
				if(!$scope.page.data[index])
					return console.log('Status: Row not exist')
				const url='/admin/api/'+model+'/findByIdAndUpdate/'+$scope.page.data[index]._id
				const args={data:{active:!$scope.page.data[index].active}}
				return worker.patch(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(admin_status_single,index)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
					$scope.page.data[index]=doc.doc
					$scope.$apply()
				})
			})
		}
		const admin_remove_single=(_id,safe)=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
				return picWorker((error,worker)=>
				{
					if(error)
						return console.log(error)
					$scope.page.data.forEach((e,index)=>
					{
						if(e._id==_id)
						{
							if(!$scope.page.data[index])
								return console.log('Remove: Row not exist')
							const url='/admin/api/'+model+'/findByIdAndDelete/'+_id
							const args={}
							if(!safe)
								safe=confirm('Delete this row?')
							if(safe)
								return worker.delete(url,args,(error,doc)=>
								{
									if(error)
										$scope.error=error
									if(doc.auth===false)
										return token_renew(admin_remove_single,_id,true)
									if(!doc.status)
										$scope.error=new Error(doc.message||"Unknown Error")
									$scope.page.data.splice(index,1)
									//$scope.$apply()
								})
						}
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
					$scope.$watch('page.limit',(newValue,oldValue)=>
					{
						setPages()
					})
					$scope.$watch('page.data',(newValue,oldValue)=>
					{
						setPages()
					})
					setPages()
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
		const token_renew=(call,arg,safe)=>
		{
			const uToken=localStorage.getItem('user-token')
			if(!uToken)
				return null
			localStorage.removeItem('token')
			return call(arg,safe)
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
				$scope.page.select={}
			}
		}
		const set2select=_id=>
		{
			if($scope.page.select[_id])
				delete $scope.page.select[_id]
		}
		const resetSelect=_=>
		{
			$scope.page.select={}
			$('.selh').prop('checked',false)
		}
		const setPages=apply=>
		{
			let pages=Math.ceil($scope.page.data.length/$scope.page.limit)
			$scope.page.pages=[]
			for(var i=0;i<pages;i++)
				$scope.page.pages.push({bigin:i*$scope.page.limit,label:(i+1)})
			$scope.page.bigin=$scope.page.pages[0]
			if($scope.page.pages.length>1)
				$scope.page.next=1
		}
		const mass2status=status=>
		{
			if($scope.page.select.length==0)
				return alert('Not Selected items found')
			const ids=Object.keys($scope.page.select)
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			const ans=confirm('Are you sure?')
			if(ans)
			{
				ids.forEach(id=>
				{
					$scope.page.data.forEach((item,index)=>
					{
						if(item._id==id)
						{
							item.active=!status
							admin_status_single(index)
						}
					})
				})
				resetSelect()
			}
		}
		const mass2remove=_=>
		{
			if($scope.page.select.length==0)
				return alert('Not Selected items found')
				const ids=Object.keys($scope.page.select)
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			const ans=confirm('Are you sure?')
			if(ans)
			{
				let todelete=[]
				ids.forEach(id=>
				{
					$scope.page.data.forEach((item,index)=>
					{
						if(item._id==id)
							todelete.push(item._id)
					})
				})
				console.log(todelete)
				todelete.forEach(_id=>
				{
					removeById(_id)
				})
				ids.forEach(id=>
				{
					$scope.page.data.forEach((item,index)=>
					{
						if(item._id==id)
							$scope.page.data.splice(index,1)
					})
				})
				//setPages()
				resetSelect()
			}
		}
		const removeById=_id=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				const url='/admin/api/'+model+'/findByIdAndDelete/'+_id
				const args={}
				return worker.delete(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(removeById,_id)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
				})
			})
		}
		const mass2select=con=>
		{
			const selh=$(con).prop('checked')
			$('.selh').prop('checked',selh)
			$('.sel').each((i,e)=>
			{
				if($(e).prop('checked')!==selh)
					$(e).click()
			})
		}
		const admin_schema_getTypeByName=(name,type)=>
		{
			const types={
				active:'checkbox',
				name:'text',
				email:'email',
				password:'password',
				images:'file'
			}
			if(type)
			{
				if(types[name]&&types[name]==type)
					return true
				if(!types[name]&&type=='text')
					return true
				return false
			}
			if(types[name])
				return types[name]
			return 'text'
		}
		const admin_udateRecord=_=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				if(!$scope.page.record._id)
					return console.log('Status: Record not set')
				const url='/admin/api/'+model+'/findByIdAndUpdate/'+$scope.page.record._id
				const args={data:$scope.page.record}
				return worker.patch(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(admin_udateRecord)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
					$scope.page.record=doc.doc
					$scope.$apply()
				})
			})
		}
		const admin_insertRecord=_=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				const url='/admin/api/'+model+'/save/'
				const args={data:$scope.page.record}
				return worker.put(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(admin_insertRecord)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
					const _id=doc.doc._id
					window.location.href='/admin/'+model+'/update/'+_id
				})
			})
		}
		const admin_removeImage=(_id,image_id)=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			return picWorker((error,worker)=>
			{
				if(error)
					return console.log(error)
				const url='/admin/api/'+model+'/image/'+_id+'/'+image_id
				const args={}
				return worker.delete(url,args,(error,doc)=>
				{
					if(error)
						$scope.error=error
					if(doc.auth===false)
						return token_renew(admin_removeImage,_id,image_id)
					if(!doc.status)
						$scope.error=new Error(doc.message||"Unknown Error")
					$scope.page.record.images=doc.doc.images
					$scope.$apply()
				})
			})
		}
		const admin_insertImage=(_id,element)=>
		{
			model=$scope.model
			if(!model)
				return console.error('Model not set')
			const token=localStorage.getItem('token')
			var data=new FormData()
			data.append('image',$(element)[0].files[0])
			return jQuery.ajax({
				url: '/admin/api/'+model+'/image/save/'+_id,
				headers: {"Authorization": "Bearer "+token},
				type:'PUT',
				data: data,
				contentType: false,
				processData: false,
				success:response=>
				{
					if(!response.status)
						$scope.error=new Error(response.message||"Unknown Error")
					if(response.doc.images)
						$scope.page.record.images=response.doc.images
					$scope.$apply()
				},
				error:(jqXHR,textStatus,errorMessage)=>
				{
					if(jqXHR.responseText)
					{
						resp=JSON.parse(jqXHR.responseText)
						if(resp.auth===false)
						{
							return jQuery.ajax({
								url: '/admin/api/'+model+'/token',
								type:'POST',
								data:{userToken:localStorage.getItem('user-token')},
								success:response=>
								{
									if(!response.status)
										return false
									localStorage.setItem('token',response.token)
									return admin_insertImage(_id,element)
								},
								error:(jqXHR,textStatus,errorMessage)=>
								{
									alert('Error uploading: ' + errorMessage)
								}
							})
						}
					}
					alert('Error uploading: ' + errorMessage)
				}
			})
		}
		$scope.page={}
		$scope.page.record={}
		$scope.page.data=[]
		$scope.page.limit=20
		$scope.page.bigin={bigin:0}
		$scope.page.pages=[]
		$scope.page.next=null
		$scope.page.previous=null
		$scope.page.order='_id'
		$scope.page.searh=''
		$scope.page.select={}
		$scope.page.error={}
		$scope.page.go2next=page_next
		$scope.page.go2previous=page_previous
		$scope.page.pageOrder=page_order
		$scope.page.set2select=set2select
		$scope.page.resetSelect=resetSelect
		$scope.page.mass2select=mass2select
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
		$scope.admin.mass2status=mass2status
		$scope.admin.mass2remove=mass2remove
		$scope.admin.edit=admin_edit
		$scope.admin.new=admin_new
		$scope.admin.getTypeByName=admin_schema_getTypeByName
		$scope.admin.insertImage=admin_insertImage
		$scope.admin.removeImage=admin_removeImage
		$scope.admin.udateRecord=admin_udateRecord
		$scope.admin.insertRecord=admin_insertRecord
		$scope.model=null
		/**
		 * Load login user data to scope (if any)
		 */
		const uToken=localStorage.getItem('user-token')
		if(uToken)
		{
			try
			{
				const user=localStorage.getItem('user')
				$scope.admin.user=JSON.parse(user)
				let dec=JSON.parse(atob(uToken.split('.')[1]))
				if(!dec.exp)
					throw new Error('User Error: Expiration time not exist. Remove login status')
				if(dec.exp<(new Date().getTime()/1000))
					throw new Error('User Error: Login token expires. Remove login status')
			}
			catch(error)
			{
				console.log(error)
				localStorage.removeItem('user')
				localStorage.removeItem('user-token')
			}
		}
	}
	catch(error)
	{
		console.log(error)
	}
}])