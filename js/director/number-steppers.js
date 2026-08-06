(()=>{
  'use strict';
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const css=document.createElement('style');css.textContent=`
.number-stepper{display:grid;grid-template-columns:38px minmax(58px,1fr) 38px;align-items:center;gap:4px;max-width:220px;margin-top:4px}.number-stepper>button{height:38px;padding:0!important;border-radius:7px!important;font-size:20px!important;font-weight:900!important;background:#172638!important;color:#fff!important;border:1px solid #3b526b!important}.number-stepper>input[type=number]{width:100%!important;height:38px!important;margin:0!important;text-align:center!important;font-weight:900!important;font-size:16px!important;appearance:textfield;-moz-appearance:textfield}.number-stepper>input::-webkit-inner-spin-button,.number-stepper>input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}@media(max-width:900px){.number-stepper{grid-template-columns:34px minmax(50px,1fr) 34px}.number-stepper>button,.number-stepper>input[type=number]{height:34px!important}}
`;document.head.appendChild(css);
    const enhance=input=>{
      if(input.dataset.stepperEnhanced==='1'||input.closest('.number-stepper'))return;
      input.dataset.stepperEnhanced='1';
      const wrap=document.createElement('span');wrap.className='number-stepper';
      const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label','Disminuir');
      const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.setAttribute('aria-label','Aumentar');
      input.parentNode.insertBefore(wrap,input);wrap.append(minus,input,plus);
      const change=dir=>{const step=Number(input.step)||1,min=input.min===''?-Infinity:Number(input.min),max=input.max===''?Infinity:Number(input.max),value=Number(input.value)||0;input.value=String(Math.max(min,Math.min(max,value+dir*step)));input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))};
      minus.addEventListener('click',()=>change(-1));plus.addEventListener('click',()=>change(1));
    };
    document.querySelectorAll('input[type=number]').forEach(enhance);
    new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches?.('input[type=number]'))enhance(n);n.querySelectorAll?.('input[type=number]').forEach(enhance)}))).observe(document.body,{subtree:true,childList:true});
  });
})();
