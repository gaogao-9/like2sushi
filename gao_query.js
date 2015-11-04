function GaoQuery(target){
	target = target || {};
	target = GaoHTMLElement(target);
	target = GaoNode(target);
	target = GaoNodeList(target);
	
	function GaoHTMLElement(target){
		target = target || {};
		
		const S = {
			find: Symbol("find"),
			text: Symbol("text"),
			html: Symbol("html"),
			createObserver: Symbol("createObserver"),
		};
		
		HTMLElement.prototype[S.find] = find;
		HTMLElement.prototype[S.createObserver] = createObserver;
		
		Object.defineProperties(HTMLElement.prototype,{
			[S.text]: {
				get: function(){
					return text.call(this);
				},
				set: function(value){
					text.call(this,value);
				}
			},
			[S.html]: {
				get: function(){
					return html.call(this);
				},
				set: function(value){
					html.call(this,value);
				}
			},
		});
		
		function find(target){
			var output = this.querySelectorAll(target) || [];
			return output;
		}
		
		function text(msg){
			if(!msg) return this.textContent;
			this.textContent = msg;
		}
		
		function html(msg){
			if(!msg) return this.innerHTML;
			this.innerHTML = msg;
		}
		
		function createObserver(callback,option){
			const observer = new MutationObserver(callback);
			observer.observe(this, option);
			return observer;
		}
		
		Object.assign(target,S);
		
		return target;
	}
	
	function GaoNode(target){
		target = target || {};
		
		const S = {
			node: Symbol("node"),
		};
		
		Object.defineProperties(Node.prototype,{
			[S.node]: {
				get: function(){
					return node.call(this);
				},
				set: function(value){
					node.call(this,value);
				}
			},
		});
		
		function node(msg){
			if(!msg) return this.nodeValue;
			this.nodeValue = msg;
		}
		
		Object.assign(target,S);
		
		return target;
	}
	
	function GaoNodeList(target){
		target = target || {};
		
		const S = {
			_iterator: Symbol.iterator,
			toArray: Symbol("toArray"),
		};
		
		// なんでNodeListにSymbol.iteratorが実装されてないんですかねぇ…（困惑）
		NodeList.prototype[Symbol.iterator] = _iterator;
		
		Object.defineProperties(NodeList.prototype,{
			[S.toArray]: {
				get: function(){
					return toArray.call(this);
				}
			},
		});
		NodeList.prototype[S.toArray] = toArray;
		
		function* _iterator(){
			for(var i=0,iLen=this.length;i<iLen;++i){
				yield this[i];
			}
		}
		
		function toArray(){
			return Array.prototype.slice.call(this);
		}
		
		Object.assign(target,S);
		
		return target;
	}
	
	return target;
}