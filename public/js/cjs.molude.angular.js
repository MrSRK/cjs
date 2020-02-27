"use strict"
angular.module('app.cjs', ['ng'])
.provider('$cjs', [function $cjs()
{
	//########################################
	const workers={}
	const catchWorker=class
	{
		constructor(path,args)
		{
			try
			{
				if(!('serviceWorker' in navigator))
					throw new Error('serviceWorker unavailable')
				if(args)
					path+='?manifest='+encodeURIComponent(btoa(JSON.stringify(args)))
				navigator.serviceWorker
				.register(path)
				.then(registration=>
				{
					console.log('ServiceWorker registration successful with scope: ', registration.scope);
				},
				error=>
				{
					throw error
				})
			}
			catch(error)
			{
				console.error(error)
			}
		}
	}
	const jsonWorker=class
	{
		worker=null
		csrf=null
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
		delete=(url,data,next)=>
		{
			const args={url:url,data:{params:data}}
			return this.call('delete',args,(error,data)=>
			{
				return next(error,data)
			})
		}
		patch=(url,data,next)=>
		{
			const args={url:url,data:{body:data}}
			return this.call('patch',args,(error,data)=>
			{
				return next(error,data)
			})
		}
		put=(url,data,next)=>
		{
			const args={url:url,data:{body:data}}
			return this.call('put',args,(error,data)=>
			{
				return next(error,data)
			})
		}
		post=(url,data,next)=>
		{
			const args={url:url,data:{body:data}}
			return this.call('post',args,(error,data)=>
			{
				return next(error,data)
			})
		}
		get=(url,data,next)=>
		{
			const args={url:url,data:{params:data}}
			return this.call('get',args,(error,data)=>
			{
				return next(error,data)
			})
		}
		call=(job,args,next)=>
		{
			try
			{
				//console.log(args)
				if(!args.data.headers)
					args.data.headers=[]
				if(this.csrf)
					args.data.headers["X-XSRF-TOKEN"]=this.csrf
				if(!this.worker)
					throw new Error('No registered worker found')
				this.worker.postMessage({job:job,args:args})
				return this.worker.onmessage=ret=>
				{
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
	workers.catch=catchWorker
	this.$get=[_=>
	{
		return{workers}
	}]

}])