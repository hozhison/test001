console.log("autoLogin：insert script => bybot.js");
var orderNo = '41931729509306961';
var find=function(n){return document.querySelector(n)},
sendMessage=chrome.runtime.sendMessage,
onMessage=chrome.runtime.onMessage,
accountInput=find("#TPL_username_1"),
passwordInput=find("#TPL_password_1"),
loginButton=find("#J_SubmitStatic"),
keyword=find("#q"),
keyword=find("#q"),
Page=
{
	//初始化加载jQuery
	initJQuery:function(){
		var jsPath = './dist/content_scripts/jquery-3.3.1.min.js';
		var temp = document.createElement('script');
		temp.setAttribute('type', 'text/javascript');
		// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
		temp.src = chrome.extension.getURL(jsPath);
		temp.onload = function()
		{
			// 放在页面不好看，执行完后移除掉
			this.parentNode.removeChild(this);
		};
		document.head.appendChild(temp);
	},
	bindEvent:function(){
		onMessage.addListener(function(n,t,e){
			// "FILL_THE_BLANK"===n.action&&(console.log("Fill the login information of Github..."),accountInput.value=n.account,passwordInput.value=n.password,loginButton.click(),e("Success."))
			if("FILL_THE_BLANK"===n.action){
				//content-script发送信息给background
				sendMessage({greeting: '你好，我是content-script呀，我主动发消息给后台！'}, function(response) {
					console.log('收到来自后台的回复：' + response);
					result = JSON.parse(response);	
					if(true===result.checkStatus){
						// window.location.href='https://trade.taobao.com/trade/itemlist/list_sold_items.htm';
						// autoCheck();
						// alert("123");
						// injectCustomJs(null);
					}
				});
			}
		})
	},
	init:function(){this.initJQuery(),this.bindEvent()}
};
Page.init();




function autoCheck(){
	// window.location.href='https://trade.taobao.com/trade/itemlist/list_sold_items.htm';
	console.log("111111111");
	sleep(3000);
	var orderNoInput = $("#bizOrderId");
	if(orderNoInput != null){
		console.log("orderInput+++++++");
		// orderNoInput.focus();
		// orderNoInput[0].value = orderNo;     
		var reactid = orderNoInput.attr('data-reactid');
		orderNoInput.after('<input type="text" class="field-input-mod__input___1UyhJ" id="bizOrderId" name="orderId" data-reactid="'+ reactid +'" value="'+ orderNo +'">');
		orderNoInput.remove();
		
		
	}
	console.log("22222222");
	var search = $("button:contains('搜索订单')");
	search.trigger('click');
	sleep(3000);
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

// 向页面注入JS
function injectCustomJs(jsPath)
{
    jsPath = jsPath || './dist/content_scripts/jquery-3.3.1.min.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function()
    {
        // 放在页面不好看，执行完后移除掉
        this.parentNode.removeChild(this);
    };
    document.head.appendChild(temp);
}


//模拟键盘输入
function fireKeyEvent(el, evtType, keyCode) {
	var evtObj;
	if (document.createEvent) {
		if (window.KeyEvent) {//firefox 浏览器下模拟事件
			evtObj = document.createEvent('KeyEvents');
			evtObj.initKeyEvent(evtType, true, true, window, true, false, false, false, keyCode, 0);
		} else {//chrome 浏览器下模拟事件
			evtObj = document.createEvent('UIEvents');
			evtObj.initUIEvent(evtType, true, true, window, 1);

			delete evtObj.keyCode;
			if (typeof evtObj.keyCode === "undefined") {//为了模拟keycode
				Object.defineProperty(evtObj, "keyCode", { value: keyCode });                       
			} else {
				evtObj.key = String.fromCharCode(keyCode);
			}

			if (typeof evtObj.ctrlKey === 'undefined') {//为了模拟ctrl键
				Object.defineProperty(evtObj, "ctrlKey", { value: true });
			} else {
				evtObj.ctrlKey = true;
			}
		}
		el.dispatchEvent(evtObj);

	} else if (document.createEventObject) {//IE 浏览器下模拟事件
		evtObj = document.createEventObject();
		evtObj.keyCode = keyCode
		el.fireEvent('on' + evtType, evtObj);
	}
}

// $(document).ready(function(){
	// console.log("1111111111");	
	// var testPassword = "181818123123";
	// var tp;
	// var cCode;
	// var testss = document.getElementById("TPL_username_1");
	// for(var i=0;i<testPassword.length;i++){
		// cCode = testPassword.charCodeAt(i);
		// fireKeyEvent(testss, "keydown", cCode);
		// fireKeyEvent(testss, "keypress", cCode);
		// fireKeyEvent(testss, "keyup", cCode);
	// }
	// console.log("222222222");		
// });

// window.onload=function (){
	// interval=setInterval(sendKey,5000);	
		
// };

function sendKey(){
	console.log("1111111111");	
	$( 'body' ).simulateKeyPress('x');
	clearInterval(interval);

}

// jQuery插件。一个jQuery对象，而不是直接调用。
jQuery.fn.simulateKeyPress = function(character) {
  // 内部调用jQuery.event.trigger
  // 参数有 (Event, data, elem). 最后一个参数是非常重要的的！
  // jQuery(this).trigger({ type: 'keypress', which: character.charCodeAt(0) });
  jQuery(this).trigger({ type: 'keypress', which: character.charCodeAt(0) });
};
 
//页面调用
function simulateKeyPress(character){
	var wsh=new ActiveXObject("WScript.Shell");  
	wsh.SendKeys((character || ''));  
}

window.onload = function(){
	simulateKeyPress('{F11}');
}


