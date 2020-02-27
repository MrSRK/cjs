/*
* Install Event Hook
*/
let config={}
self.addEventListener('install',event=>
{
	let manifest=null
	manifest=new URL(location).searchParams.get('manifest')
	if(manifest)
		manifest=JSON.parse(atob(manifest))
	event.waitUntil(
		fetch(manifest.url)
		.then(response=>response.json())
		.then(json=>
		{
			config=json
			return setCache((error,c)=>
			{
				if(error)
					console.log(error)
			})
		})
		.catch(error=>
		{
			console.log(error)
		}))
})
/*
* Fetch Event Hook
*/
self.addEventListener('fetch',event=>
{
	getCache(event,(error,response)=>
	{
		if(error)
			console.log(error)
		return event.respondWith(response)
	})
})
/*
* Activate Event Hook
*/
self.addEventListener('activate',event=>
{
  event.waitUntil(updateCache())
})

/**
 * Remove all caches without the current Cache name
 */
const updateCache=_=>
{
	const name=config.name||'cjs'
	const version=config.version||1
	const cachesCurrentName=name+'.v'+version
	return caches.keys().then(cacheNames=>
	{
    	return Promise.all(
			cacheNames.map(cacheName=>
			{
        		if(cachesCurrentName!=cacheName)
            	return caches.delete(cacheName)
        	})
      	)
    })
}
/**
 * Return or catch and return a request's response
 * @param {Object} request fetch event's request
 */
const getCache=(event,next)=>
{
	return caches.match(event.request)
	.then(response=>
	{
		if(response)
			return next(null,response)
		return next(null,fetch(event.request))
	})
	.catch(error=>
	{
		return next(error)
	})
}
/**
 * @param {String} name	Current catch name
 * @param {String[]} urls	Array of url(s) to catch
 * @param {Function} next callback function(error|null)
 */
const setCache=next=>
{
	const name=config.name||'cjs'
	const version=config.version||1
	const urls=config.urls||[]
	return caches.open(name+'.v'+version)
	.then(cache=>
	{
			return next(null,cache.addAll(urls))
	})
	.catch(error=>
	{
		return next(error)
	})
}