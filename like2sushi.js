const $  = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const _  = GaoQuery();

task(function*(){
	// 右下に表示されるバルーンに対する上書き処理
	$("#spoonbill-outer")[_.createObserver]((mutations)=>{
		for(var mutation of mutations){
			mutation.addedNodes[_.toArray].forEach((ele)=>{
				if(!ele[_.find](".Icon--heartBadge")[0]) return; // ふぁぼ以外(RT)の時は弾く
				
				const target = ele[_.find](".WebToast-contentBox");
				target[0][_.html] = "「すし」しました";
				target[1].childNodes[_.toArray]
					.filter(x=>(x.nodeType===Node.TEXT_NODE&&~x.nodeValue.indexOf("さんがいいねしました")))
					.forEach(x=>{
						x[_.node] = "さんが「すし」しました";
					});
			});
		}
	}, {attributes: false, childList: true, characterData: false});
	
}());

function task(gen,res){
	const itr = gen.next(res);
	
	if(itr.done) return;
	
	itr.value.then((val)=>{
		if(val === null) console.warn("nullはrejectの時だけ渡してくれ頼む");
		Task(gen,val);
	}).catch((val)=>{
		Task(gen,null);
	})
}
