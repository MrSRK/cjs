onmessage=event=>{
    // Worker
    const job=event.data.job||'hello'
    const args=event.data.args||{}
    if(!jobs[job])
        return jobs.notexist(args,(error,data)=>
        {
            return postMessage({error:error,data:data})
        })
    return jobs[job](args,(error,data)=>
    {
        return postMessage({error:error,data:data})
    })
}
const jobs={}
jobs.delete=(args,next)=>
{
    let data={}
    if(args.data.body)
        data=args.data.body
    if(args.data.params)
    {
        q=[]
        for(let key in args.data.params)
            q.push(`${key}=${args.data.params[key]}`)
        args.url+='?'+q.join('&')
    }
    if(!args.url)
        return next({name:'Error',message:'get url not set'},null)
    const http=new XMLHttpRequest()
    http.open("DELETE",args.url,true)
    http.setRequestHeader("Content-Type","application/json;charset=UTF-8")
    if(args.data.headers)
        for(let key in args.data.headers)
            http.setRequestHeader(key,args.data.headers[key])
    http.send(JSON.stringify(data))
    return http.onreadystatechange=e=>
    {
        try
        {
            if(http.readyState==4)
                return next(null,JSON.parse(http.responseText))
        }
        catch(error)
        {
            return next({name:'SyntaxError',message:'JSON.parse Error'},null)
        }
    }
}
jobs.patch=(args,next)=>
{
    let data={}
    if(args.data.body)
        data=args.data.body
    if(args.data.params)
    {
        q=[]
        for(let key in args.data.params)
            q.push(`${key}=${args.data.params[key]}`)
        args.url+='?'+q.join('&')
    }
    if(!args.url)
        return next({name:'Error',message:'get url not set'},null)
    const http=new XMLHttpRequest()
    http.open("PATCH",args.url,true)
    http.setRequestHeader("Content-Type","application/json;charset=UTF-8")
    if(args.data.headers)
        for(let key in args.data.headers)
            http.setRequestHeader(key,args.data.headers[key])
    http.send(JSON.stringify(data))
    return http.onreadystatechange=e=>
    {
        try
        {
            if(http.readyState==4)
                return next(null,JSON.parse(http.responseText))
        }
        catch(error)
        {
            return next({name:'SyntaxError',message:'JSON.parse Error'},null)
        }
    }
}
jobs.put=(args,next)=>
{
    let data={}
    if(args.data.body)
        data=args.data.body
    if(args.data.params)
    {
        q=[]
        for(let key in args.data.params)
            q.push(`${key}=${args.data.params[key]}`)
        args.url+='?'+q.join('&')
    }
    if(!args.url)
        return next({name:'Error',message:'get url not set'},null)
    const http=new XMLHttpRequest()
    http.open("PUT",args.url,true)
    http.setRequestHeader("Content-Type","application/json;charset=UTF-8")
    if(args.data.headers)
        for(let key in args.data.headers)
            http.setRequestHeader(key,args.data.headers[key])
    http.send(JSON.stringify(data))
    return http.onreadystatechange=e=>
    {
        try
        {
            if(http.readyState==4)
                return next(null,JSON.parse(http.responseText))
        }
        catch(error)
        {
            return next({name:'SyntaxError',message:'JSON.parse Error'},null)
        }
    }
}
jobs.post=(args,next)=>
{
    let data={}
    if(args.data.body)
        data=args.data.body
    if(args.data.params)
    {
        q=[]
        for(let key in args.data.params)
            q.push(`${key}=${args.data.params[key]}`)
        args.url+='?'+q.join('&')
    }
    if(!args.url)
        return next({name:'Error',message:'get url not set'},null)
    const http=new XMLHttpRequest()
    http.open("POST",args.url,true)
    http.setRequestHeader("Content-Type","application/json;charset=UTF-8")
    if(args.data.headers)
        for(let key in args.data.headers)
            http.setRequestHeader(key,args.data.headers[key])
    http.send(JSON.stringify(data))
    return http.onreadystatechange=e=>
    {
        try
        {
            if(http.readyState==4)
                return next(null,JSON.parse(http.responseText))
        }
        catch(error)
        {
            return next({name:'SyntaxError',message:'JSON.parse Error'},null)
        }
    }
}
jobs.get=(args,next)=>
{
    if(!args.url)
        return next({name:'Error',message:'get url not set'},null)
    if(args.data.params)
    {
        q=[]
        for(let key in args.data.params)
        {
            if(key!='body')
                q.push(`${key}=${args.data.params[key]}`)
        }
        args.url+='?'+q.join('&')
    }
    const http=new XMLHttpRequest()
    http.open("GET",args.url,true)
    if(args.data.headers)
        for(let key in args.data.headers)
            http.setRequestHeader(key,args.data.headers[key])
    http.send()
    return http.onreadystatechange=e=>
    {
        try
        {
            if(http.readyState==4)
                return next(null,JSON.parse(http.responseText))
        }
        catch(error)
        {
            return next({name:'SyntaxError',message:'JSON.parse Error'},null)
        }
    }
}
jobs.hello=(args,next)=>
{
    return next(null,{message:'Worker Working :D'})
}
jobs.notexist=(args,next)=>
{
    return next({name:'Error',message:'Sorry job not exist :('},null)
}