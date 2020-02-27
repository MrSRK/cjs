angular.module('app.cjs', ['ng'])
.provider('$cjs', [function $cjs()
{
	
	const workers={}
	workers.json={}
	workers.json.xhr={}
	//JSON XHR WORKER
	workers.json.xhr.worker=null
	workers.json.xhr.path=null
	workers.json.xhr.headers={}
	workers.json.delete=(url,data,next)=>
	{
		const args={url:url,data:{params:data}}
		return workers.json.xhr.run('patch',args,(error,data)=>
		{
			return next(error,data)
		})
	}
	workers.json.patch=(url,data,next)=>
	{
		const args={url:url,data:{body:data}}
		return workers.json.xhr.run('patch',args,(error,data)=>
		{
			return next(error,data)
		})
	}
	workers.json.put=(url,data,next)=>
	{
		const args={url:url,data:{body:data}}
		return workers.json.xhr.run('put',args,(error,data)=>
		{
			return next(error,data)
		})
	}
	workers.json.post=(url,data,next)=>
	{
		const args={url:url,data:{body:data}}
		return workers.json.xhr.run('post',args,(error,data)=>
		{
			return next(error,data)
		})
	}
	workers.json.get=(url,data,next)=>
	{
		const args={url:url,data:{params:data}}
		return workers.json.xhr.run('get',args,(error,data)=>
		{
			return next(error,data)
		})
	}
	/**
	 * Run json xhr worker
	 */
	workers.json.xhr.run=(job,args,next)=>
	{
		try
		{
			if(args.data.headers)
				args.data.headers=Object.assign(args.data.headers,workers.json.xhr.headers)
			else
				args.data.headers=workers.json.xhr.headers
			if(!workers.json.xhr.worker)
				throw new Error('No registered worker found')
			workers.json.xhr.worker.postMessage({job:job,args:args})
			return workers.json.xhr.worker.onmessage=ret=>
			{
				return next(null,ret)
			}
		}
		catch(error)
		{
			return next(error,null)
		}
	}
	workers.json.csrf=token=>
	{
		workers.json.xhr.headers["X-XSRF-TOKEN"]=token
	}
	/**
	 * Register json xhr worker
	 */
	workers.json.register=(path,token,next)=>
	{
		try
		{
			if(token)
				workers.json.csrf(token)
			workers.json.xhr.path=path
			workers.json.xhr.worker=new Worker(path)
			return next(null,true)
		}
		catch(error)
		{
			next(error,null)
		}
	}


	
	
	//########################################
	const module={}





	this.$get=[_=>
	{
		return{workers}
	}]

}])