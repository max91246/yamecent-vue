import{r as e}from"./rolldown-runtime-DMcso9tT.js";import{K as t,St as n,bt as r}from"./vue.runtime.esm-bundler-DvpurtHF.js";import{Gs as i,Sd as a,Vs as o,xd as s}from"./index-CHfQwEvm.js";import{t as c}from"./data-NE0jzNiF.js";var l=e({useColumns:()=>u});a();function u(){let e=n([]),a=n(!0),l=[{label:`日期`,prop:`date`},{label:`姓名`,prop:`name`},{label:`地址`,prop:`address`}],u=r({pageSize:20,currentPage:1,pageSizes:[20,40,60],total:0,align:`right`,background:!0,size:`default`}),d=r({text:`正在加载第一页...`,viewBox:`-10, -10, 50, 50`,spinner:`
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `}),f={offsetBottom:110};function p(e){}function m(e){d.text=`正在加载第${e}页...`,a.value=!0,i(600).then(()=>{a.value=!1})}return t(()=>{i(600).then(()=>{let t=[];Array.from({length:6}).forEach(()=>{t.push(o(c,!0))}),t.flat(1/0).forEach((t,n)=>{e.value.push(s({id:n},t))}),u.total=e.value.length,a.value=!1})}),{loading:a,columns:l,dataList:e,pagination:u,loadingConfig:d,adaptiveConfig:f,onSizeChange:p,onCurrentChange:m}}export{u as n,l as t};