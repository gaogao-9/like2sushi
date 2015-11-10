const $  = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const _  = GaoQuery();

task(function*(){
	// URLが変化した際に通知するmessageを登録する
	overrideHistoryPushState();
	
	// 右下に表示されるバルーンに対する上書き処理
	overrideToastSushi();
	
	// 通知ページに表示されるいいねに対する上書き処理
	overrideNotifyPageSushi();
	
	// お気に入り一覧ページに対する上書き処理
	overrideFavoriteListPage();
}());

// URLが変化した際に通知するmessageを登録する
function overrideHistoryPushState(){
	const $script = document.createElement("script");
	$script.textContent = `
		(function(){
			const _pushState = window.history.pushState;
			window.history.pushState = function(){
				const res = _pushState.apply(this,arguments);
				
				window.postMessage("URLChanged",location.href);
				
				return res;
			};
		})();
	`;
	document.head.appendChild($script);
}

// 右下に表示されるバルーンに対する上書き処理
function overrideToastSushi(){
	$("#spoonbill-outer")[_.createObserver]((mutations)=>{
		for(var mutation of mutations){
			update(mutation.addedNodes);
		}
	}, {attributes: false, childList: true, characterData: false});
	
	function update(nodeList){
		nodeList[_.toArray].forEach((ele)=>{
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
}

// 通知ページに表示されるいいねに対する上書き処理
function overrideNotifyPageSushi(){
	// 既に表示されているリストの上書き
	update($$("#stream-items-id .stream-item-content"));
	
	var timelineObserver = null;
	var streamObserver   = null;
	
	if(location.pathname === "/i/notifications"){
		// アクセス時にnotificationsのページにいる時は素直に登録
		streamObserver = registerStreamObserver();
	}
	else{
		// アクセス時にnotificationsのページに居ない場合は、ページ移動を監視して、移動した瞬間に監視登録をする
		window.addEventListener("message",function(eve){
			if(eve.data !== "URLChanged") return; // 関係ないメッセージはスルー
			if(eve.origin !== "https://twitter.com") return; // 関係ない発生元はスルー
			if(location.pathname !== "/i/notifications"){
				// 関係ないページの移動時に、オブザーバーが登録されていたら解除する
				if(streamObserver){
					streamObserver.disconnect();
					streamObserver = null;
				}
				if(timelineObserver){
					timelineObserver.disconnect();
					timelineObserver = null;
				}
				return;
			}
			
			// 登録されて無ければ新たに追加されるリストの監視
			if(!streamObserver){
				streamObserver = registerStreamObserver();
			}
			
			// 登録されて無ければ新たに追加されるリストの監視
			if(!timelineObserver){
				timelineObserver = $("#timeline")[_.createObserver]((mutations)=>{
					// 通知ページ以外にいる時は更新処理を行わせない
					if(location.pathname !== "/i/notifications") return;
					
					// 開いた瞬間に表示されているリストの更新
					update($$("#stream-items-id .stream-item-content"));
					
					// 既に登録されていたら再登録する
					if(streamObserver){
						streamObserver.disconnect();
						streamObserver = null;
						streamObserver = registerStreamObserver();
					}
					
					// 自分自身の監視解除
					timelineObserver.disconnect();
					timelineObserver = null;
				}, {attributes: true, childList: true, characterData: false, subtree: true});
			}
		},false);
	}
	
	// 新たにふぁぼられたり、過去ログを掘り返したりした際のリスト監視
	function registerStreamObserver(){
		return $("#stream-items-id")[_.createObserver]((mutations)=>{
			// 通知ページ以外にいる時は更新処理を行わせない
			if(location.pathname !== "/i/notifications") return;
			
			for(var mutation of mutations){
				update(mutation.addedNodes);
			}
		}, {attributes: false, childList: true, characterData: false});
	}
	
	function update(nodeList){
		// 通知ページ以外にいる時は更新処理を行わせない
		if(location.pathname !== "/i/notifications") return;
		
		nodeList[_.toArray].forEach((ele)=>{
			const header = ele[_.find](".stream-item-activity-line");
			const button = ele[_.find](".activity-supplement button>span");
			
			// ヘッダ部分の書き換え
			if(header.length){
				header[0].childNodes[_.toArray]
					.filter(x=>(x.nodeType===Node.TEXT_NODE&&~x.nodeValue.indexOf("いいねしました")))
					.forEach(x=>{
						x[_.node] = x[_.node].replace("いいね","すし");
					});
			}
			
			// ボタン部分の書き換え
			if(button.length){
				button[_.toArray].forEach(x=>{
					x[_.text] = x[_.text].replace("いいね","すし");
				});
			}
		});
	}
}


// お気に入り一覧ページに対する上書き処理
function overrideFavoriteListPage(){
	if(location.pathname === "/favorites"){
		// アクセス時にfavoritesのページにいる時は素直に更新
		update();
	}
	else{
		var headerObserver = null;
		
		// アクセス時にnotificationsのページに居ない場合は、ページ移動を監視して、移動した瞬間に更新
		window.addEventListener("message",function(eve){
			if(eve.data !== "URLChanged") return; // 関係ないメッセージはスルー
			if(eve.origin !== "https://twitter.com") return; // 関係ない発生元はスルー
			if(location.pathname !== "/favorites") return;
			
			if(!headerObserver) headerObserver = $("#page-container")[_.createObserver]((mutations)=>{
				// 通知ページ以外にいる時は更新処理を行わせない
				if(location.pathname !== "/favorites") return;
				
				update();
				
				// 1回限りで終了する
				headerObserver.disconnect();
				headerObserver = null;
			}, {attributes: false, childList: true, characterData: false});
		},false);
	}
	
	function update(){
		if(location.pathname !== "/favorites") return;
		$("#content-main-heading")[_.text] = "すし";
	}
}

function task(gen,res){
	const itr = gen.next(res);
	
	if(itr.done) return;
	
	itr.value.then((val)=>{
		if(val === null) console.warn("nullはrejectの時だけ渡してくれ頼む");
		task(gen,val);
	}).catch((val)=>{
		task(gen,null);
	})
}
