"use strict"
angular.module('app.cjs', ['ng'])
.provider('$cjs', [function $cjs()
{
	//########################################
	const workers={}
	const jsonWorker=class
	{
		worker=null
		csrf=null
		token=null
		load=0
		constructor(path,token)
		{
			try
			{
				if(token)
					this.csrf=token
				this.worker=new Worker(path)
			}
			catch(error)
			{
				console.log(error)
			}
		}
		setToken=token=>
		{
			this.token=token
		}
		delete=(url,data,next)=>
		{
			try
			{
				const args={url:url,data:{params:data}}
				if(this.token)
					args.data.headers={Authorization:'Bearer '+this.token}
				return this.call('delete',args,(error,data)=>
				{
					return next(error,data.data.data)
				})
			}
			catch(error)
			{
				return next(error)
			}
		}
		patch=(url,data,next)=>
		{
			try
			{
				const args={url:url,data:{body:data}}
				if(this.token)
					args.data.headers={Authorization:'Bearer '+this.token}
				return this.call('patch',args,(error,data)=>
				{
					return next(error,data.data.data)
				})
			}
			catch(error)
			{
				return next(error)
			}
		}
		put=(url,data,next)=>
		{
			try
			{
				const args={url:url,data:{body:data}}
				if(this.token)
					args.data.headers={Authorization:'Bearer '+this.token}
				return this.call('put',args,(error,data)=>
				{
					return next(error,data.data.data)
				})
			}
			catch(error)
			{
				return next(error)
			}
		}
		post=(url,data,next)=>
		{
			try
			{
				const args={url:url,data:{body:data}}
				if(this.token)
					args.data.headers={Authorization:'Bearer '+this.token}
				return this.call('post',args,(error,data)=>
				{
					return next(error,data.data.data)
				})
			}
			catch(error)
			{
				return next(error)
			}
		}
		get=(url,data,next)=>
		{
			try
			{
				const args={url:url,data:{params:data}}
				if(this.token)
					args.data.headers={Authorization:'Bearer '+this.token}
				return this.call('get',args,(error,data)=>
				{
					return next(error,data.data.data)
				})
			}
			catch(error)
			{
				return next(error)
			}
		}
		call=(job,args,next)=>
		{
			try
			{
				this.load++
				if(!args.data.headers)
					args.data.headers=[]
				if(this.csrf)
					args.data.headers["X-XSRF-TOKEN"]=this.csrf
				if(!this.worker)
					throw new Error('No registered worker found')
				this.worker.postMessage({job:job,args:args})
				return this.worker.onmessage=ret=>
				{
					this.load--
					return next(null,ret)
				}
			}
			catch(error)
			{
				return next(error,null)
			}
		}
	}
	workers.json=jsonWorker
	this.$get=[_=>
	{
		return{workers}
	}]

}])