import{r as e}from"./rolldown-runtime-DMcso9tT.js";import{K as t,St as n,bt as r,lt as i}from"./vue.runtime.esm-bundler-DvpurtHF.js";import{Ot as a,aa as o,ia as s,wt as c}from"./index-BVKzGNvW.js";import{t as l}from"./data-6rBcBIwQ.js";var u=e({useColumns:()=>d});o();function d(){let e=n([]),o=n(!0),u=n(`no`),d=n(`nohide`),f=n(`default`),p=n(`right`),m=[{type:`selection`,align:`left`,reserveSelection:!0,hide:()=>u.value===`no`},{label:`日期`,prop:`date`,hide:()=>d.value===`hideDate`},{label:`姓名`,prop:`name`,hide:()=>d.value===`hideName`},{label:`地址`,prop:`address`,hide:()=>d.value===`hideAddress`}],h=r({pageSize:10,currentPage:1,pageSizes:[10,15,20],total:0,align:`right`,background:!0,size:`default`}),g=r({text:`正在加载第一页...`,viewBox:`-10, -10, 50, 50`,spinner:`
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `});function _(e){h.size=e}function v(e){}function y(e){g.text=`正在加载第${e}页...`,o.value=!0,a(600).then(()=>{o.value=!1})}return i(()=>{h.align=p.value}),t(()=>{a(600).then(()=>{let t=[];Array.from({length:6}).forEach(()=>{t.push(c(l,!0))}),t.flat(1/0).forEach((t,n)=>{e.value.push(s({id:n},t))}),h.total=e.value.length,o.value=!1})}),{loading:o,columns:m,dataList:e,select:u,hideVal:d,tableSize:f,pagination:h,loadingConfig:g,paginationAlign:p,onChange:_,onSizeChange:v,onCurrentChange:y}}export{d as n,u as t};