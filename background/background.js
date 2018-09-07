//域名
var serverUrl = "http://proxy.tintop.cn:22880";
//自动审核状态
var check = false;
var time = 1;
window.webStoreName = "";
window.accessToken = "";
window.refreshToken = "";
window.tabId = "";
function changestatus(){
	if(check){
		check = false;
	}
	else{
		check = true;
	}
	// console.log('checkStatus:' + check);
}

function stopCheck(){
	check = false;
	console.log('stopCheck!! checkStatus:' + check);
}

function setAccessToken(token1,token2){
	accessToken = token1;
	refreshToken = token2;
}

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log('收到来自content-script的消息：');
    // console.log(request, sender, sendResponse);
    // sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
	// var result = {"checkStatus" : check};
    // sendResponse(JSON.stringify(result));
	// console.log(JSON.stringify(sender));
	if("webStoreName"===request.msgType){
		webStoreName = request.webStoreName;
		tabId = sender.tab.id;
	}else if("salesOrders"===request.msgType){
		console.log("upload orders info...");
		console.log("orders:" + request.orders);
		console.log(JSON.stringify(request.orders));
		uploadOrders(request.orders);
	}
	
});

chrome.alarms.create('alarmsTest', {
    periodInMinutes:3,	//非null表示alarm周期性执行的时间间隔，单位minute,最小值1
    delayInMinutes:1	//onAlarm事件发出的延迟时间，单位minute，最小值
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	var myDate = new Date();
	
	console.log(myDate.toLocaleTimeString() + "+++" +check);
	refreshTokenApi();
	if(check && ""!=webStoreName){
		// var myDate = new Date();
		console.log("accessToken:" + accessToken);
		console.log(myDate.toLocaleTimeString() + "+++" +time);
		time++;
		getSyncAccount();
		// sendMessageToContentScript({'msgType':'getOrders', 'webSiteCode':'taobao','buyerNicks':['lovequeque99', 'lily_marine']}, function(response){});
	}
	
	
});

function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}


function getBuyerNicks(){
	//httpPost
	var result;
	var xhr = new XMLHttpRequest();
	var postData = {"webStoreName": webStoreName,"webSiteCode":"taobao"};
	//xhr.open(url,true)第二个参数代表是否异步
	xhr.open("POST", serverUrl + "/mbs/api/audit/find_buy_account", true);
	xhr.setRequestHeader("access_token", accessToken);
	xhr.setRequestHeader("Content-type", "application/json");
	//设置请求头为：Content-type:application/jsonjson ，数据必须转化为字符串
	xhr.send(JSON.stringify(postData));
	//xhr状态改变的时候会触发的时间，异步请求时的回调函数
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				result = JSON.parse(xhr.responseText);
				console.log(JSON.stringify(result));
				
				if(result.success){
					var buyerNicks = [];
					var webSiteCode = "";
					var content = result.content;
					for(var i in content){
						var json = content[i];
						webSiteCode = json.webSiteCode;
						buyerNicks.push(json.buyAccount);
					}
					console.log("send buyerNicks:" + buyerNicks);
					// sendMessageToContentScript({'msgType':'getOrders', 'webSiteCode':webSiteCode,'buyerNicks':buyerNicks}, function(response){});
					chrome.tabs.sendMessage(tabId, {'msgType':'getOrders', 'webSiteCode':webSiteCode,'buyerNicks':buyerNicks}, function(response){});
				}
			}
		}
	};
}

function uploadOrders(orderData){
	var xhr = new XMLHttpRequest();
	var postData = {"salesOrders": orderData};
	//xhr.open(url,true)第二个参数代表是否异步
	xhr.open("POST", serverUrl + "/mbs/api/audit/submit_sales_order", true);
	xhr.setRequestHeader("access_token", accessToken);
	xhr.setRequestHeader("Content-type", "application/json");
	//设置请求头为：Content-type:application/jsonjson ，数据必须转化为字符串
	xhr.send(JSON.stringify(postData));
	//xhr状态改变的时候会触发的时间，异步请求时的回调函数
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				console.log("upload success");
			}
		}
	};
	
}

//页面调用
window.onload=function (){
	chrome.storage.local.get("accessToken", function(value) {
		console.log(value);
		accessToken = value.accessToken;
	});
	chrome.storage.local.get("refreshToken", function(value) {
		console.log(value);
		refreshToken = value.refreshToken;
	});
}

function refreshTokenApi(){
	var xhr = new XMLHttpRequest();
	var postData = {"refreshToken": refreshToken};
	//xhr.open(url,true)第二个参数代表是否异步
	xhr.open("POST", serverUrl + "/ums/pub/user/refresh_token", true);
	xhr.setRequestHeader("Content-type", "application/json");
	//设置请求头为：Content-type:application/jsonjson ，数据必须转化为字符串
	xhr.send(JSON.stringify(postData));
	//xhr状态改变的时候会触发的时间，异步请求时的回调函数
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				result = JSON.parse(xhr.responseText);
				if(result.success){
					console.log('refreshToken成功'); 
					accessToken = result.content.access_token;
					refreshToken = result.content.refresh_token;
					chrome.storage.local.set({'accessToken': accessToken,'refreshToken':refreshToken}, function() {
						console.log('存储token成功');      
					});
					
				}
			}
		}
	};
	
}

function getSyncAccount(){
	//httpPost
	var result;
	var xhr = new XMLHttpRequest();
	var postData = {};
	//xhr.open(url,true)第二个参数代表是否异步
	xhr.open("POST", serverUrl + "/mbs/api/audit/find_unaudit_account", true);
	xhr.setRequestHeader("access_token", accessToken);
	xhr.setRequestHeader("Content-type", "application/json");
	//设置请求头为：Content-type:application/jsonjson ，数据必须转化为字符串
	xhr.send(JSON.stringify(postData));
	//xhr状态改变的时候会触发的时间，异步请求时的回调函数
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				result = JSON.parse(xhr.responseText);
				console.log(JSON.stringify(result));
				
				if(result.success){
					var orders = [];
					var webSiteCode = "";
					var content = result.content;
					for(var i in content){
						var json = content[i];
						webSiteCode = json.webSiteCode;
						orders.push(json.orderNo);
					}
					console.log("send orders:" + orders);
					if(orders.length > 0){
						chrome.tabs.sendMessage(tabId, {'msgType':'syncAccount', 'webSiteCode':webSiteCode,'orders':orders}, function(response){});
					}
					
				}
			}
		}
	};
}



	