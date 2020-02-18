"use strict"
const defaultRoutes={
    pug:
    [
        'list',
        'show',
        'signIn',
        'sighUp',
        'signOut',
        'table',
        'edit',
        'new',
    ],
    api:
    [
        'apiList',
        'apiShow',
        'apiSignIn',
        'apiSignUp',
        'apiSignOut',
        'apiTable',
        'apiEdit'
    ]
}
const pug={}
defaultRoutes.pug.forEach(f=>
{
    pug[f]=(toolbox,model,req,res)=>
    {
        return res.status(200).render(f,
        {
       
        })
    }
})
module.exports.pug=pug