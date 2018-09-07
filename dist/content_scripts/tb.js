console.log("autoLogin：insert script => tb.js");
var buyerNick = "lily_marine";
var webStoreName = "";
var find = function (n) {
        return document.querySelector(n)
    },
    sendMessage = chrome.runtime.sendMessage,
    onMessage = chrome.runtime.onMessage,
    accountInput = find("#TPL_username_1"),
    passwordInput = find("#TPL_password_1"),
    loginButton = find("#J_SubmitStatic"),
    keyword = find("#q"),
    Page =
        {
            //初始化加载jQuery
            initJQuery: function () {
                var jsPath = './dist/content_scripts/jquery-3.3.1.min.js';
                var temp = document.createElement('script');
                temp.setAttribute('type', 'text/javascript');
                // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
                temp.src = chrome.extension.getURL(jsPath);
                temp.onload = function () {
                    // 放在页面不好看，执行完后移除掉
                    this.parentNode.removeChild(this);
                };
                document.head.appendChild(temp);
            },
            bindEvent: function () {
                onMessage.addListener(function (n, t, e) {
                    // "FILL_THE_BLANK"===n.action&&(console.log("Fill the login information of Github..."),accountInput.value=n.account,passwordInput.value=n.password,loginButton.click(),e("Success."))
                    if ("FILL_THE_BLANK" === n.action) {
                        //content-script发送信息给background
                        sendMessage({greeting: '你好，我是content-script呀，我主动发消息给后台！'}, function (response) {
                            console.log('收到来自后台的回复：' + response);
                            result = JSON.parse(response);
                            if (true === result.checkStatus) {
                                // window.location.href='https://trade.taobao.com/trade/itemlist/list_sold_items.htm';
                                // autoCheck();
                                // alert("123");
                                // injectCustomJs(null);
                            }
                        });
                    }
                })
            },
            init: function () {
                this.initJQuery(), this.bindEvent()
            }
        };
Page.init();


// 向页面注入JS
function injectCustomJs(jsPath) {
    jsPath = jsPath || './dist/content_scripts/jquery-3.3.1.min.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function () {
        // 放在页面不好看，执行完后移除掉
        this.parentNode.removeChild(this);
    };
    document.head.appendChild(temp);
}


function getOrders() {

    var cookieStr = document.cookie;
    // console.log(cookieStr);
    //httpPost
    var result;
    var xhr = new XMLHttpRequest();
    var postData = encodeFormData({
        "pageNum": 1,
        "pageSize": 15,
        "queryMore": false,
        "useCheckcode": false,
        "useOrderInfo": false,
        "errorCheckcode": false,
        "action": "itemlist/SoldQueryAction",
        "prePageNo": 1,
        "buyerNick": buyerNick

    });
    xhr.open("POST", "https://trade.taobao.com/trade/itemlist/asyncSold.htm?event_submit_do_query=1&_input_charset=utf8", true);
    xhr.setRequestHeader("accept", "application/json, text/javascript, */*; q=0.01");
    xhr.setRequestHeader("accept-language", "zh-CN,zh;q=0.9");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    //json数据转化为字符串
    //xhr.send(JSON.stringify(postData));
    xhr.send(postData);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = xhr.responseText;
                // console.log(result);
                var data = JSON.parse(result).mainOrders;
                // console.log("data:" + data);
                var json = extractingData(data);
                // console.log(json);
                if (json.length > 0) {
                    sendMessage({"msgType": "salesOrders", "orders": json}, function (response) {
                    });
                }

            }
        }
    };
    // clearInterval(interval);
}


//页面调用
jQuery(document).ready(function ($) {
    //测试通过买家名称取订单数据
    // interval=setInterval(syncAccount,5000);

    interval = setInterval(getWebStoreName, 5000);


});

function getWebStoreName() {

    if ("" == webStoreName) {
        var eles1 = $('a.title');
        console.log("eles1.length:" + eles1.length);
        if (eles1.length > 0) {
            webStoreName = eles1[0].text;
            console.log("webStoreName:" + webStoreName);
            sendMessage({"msgType": "webStoreName", "webStoreName": webStoreName}, function (response) {
            });
            clearInterval(interval);
        } else {
            var eles = $("a:contains('商家中心'),span:contains('卖家中心')");
            console.log("eles.length:" + eles.length);
            if (eles.length > 0) {
                eles[0].click();
            }
        }

    }

    if ("" == webStoreName) {
        var xhr = new XMLHttpRequest();
        var resp;
        try {
            xhr.open("GET", "https://myseller.taobao.com/ajaxProxy.do?_ksTS=1535443691844_13&callback=seller_layout&action=FrameworkLayoutAction&event_submit_do_layout_data=true", true);
            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    // JSON解析器不会执行攻击者设计的脚本.
                    resp = xhr.responseText;
                    webStoreName = resp.match(/"shopName":"(\S*?)","/)[1];
                    console.log(webStoreName);
                    sendMessage({"msgType": "webStoreName", "webStoreName": webStoreName}, function (response) {
                    });
                    clearInterval(interval);
                }
            }
        } catch (err) {
            console.log("get webStoreName error");
        }
    }
}

function encodeFormData(data) {
    if (!data) return '';
    var pairs = [];
    for (var name in data) {
        if (!data.hasOwnProperty(name)) continue;
        if (typeof data[name] === 'function') continue;
        var value = data[name].toString();
        name = encodeURIComponent(name.replace('%20', '+'));
        value = encodeURIComponent(value.replace('%20', '+'));
        pairs.push(name + '=' + value);
    }
    return pairs.join('&');
}

function extractingData(data) {
    var orders = [];
    //表示遍历数组，而i表示的是数组的下标值，
    //result[i]表示获得第i个json对象即JSONObject
    //result[i]通过.字段名称即可获得指定字段的值
    for (var i in data) {
        var order = {};
        var orderInfo = data[i];
        // console.log("orderInfo:" + orderInfo);
        order.orderTime = Date.parse(orderInfo.orderInfo.createTime);
        order.webSiteCode = "taobao";
        order.webStoreName = webStoreName;
        order.buyerId = orderInfo.buyer.id;
        order.buyerName = orderInfo.buyer.nick;
        order.orderId = orderInfo.orderInfo.id;
        order.usedAmount = orderInfo.payInfo.actualFee;
        order.status = orderInfo.statusInfo.text;
        order.goodsTitle = orderInfo.subOrders[0].itemInfo.title;
        order.quantity = orderInfo.subOrders[0].quantity;
        order.realTotal = orderInfo.subOrders[0].priceInfo.realTotal;
        order.asin = getAsin(orderInfo.subOrders[0].itemInfo.itemUrl);
        orders.push(order);
        sleep(3000)
    }
    return orders;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if ('getOrders' == request.msgType && "taobao" == request.webSiteCode) {
        console.log("getOrders....");
        var buyerNicks = request.buyerNicks;
        console.log("buyerNicks:" + buyerNicks);
        for (var i in buyerNicks) {
            buyerNick = buyerNicks[i];
            getOrders();
        }
    } else if ('syncAccount' == request.msgType && "taobao" == request.webSiteCode) {
        console.log("syncAccount....");
        var orders = request.orders;
        console.log("orders:" + orders);
        for (var i in orders) {
            var order = orders[i];
            syncAccount(order);
        }
    }


});

function getAsin(url) {
    var xhr = new XMLHttpRequest();
    var resp;
    var asin;
    try {
        xhr.open("GET", "https:" + url, false);
        xhr.send();
        if (xhr.readyState == 4) {
            // JSON解析器不会执行攻击者设计的脚本.
            resp = xhr.responseText;
            asin = resp.match(/\\"itemId\\":(\S*?),\\"/)[1];
            console.log("asin:" + asin);
            return asin;
        }
    } catch (err) {
        return null;
    }
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

function myrefresh() {
    window.location.reload();
}

setTimeout('myrefresh()', 600000);

function syncAccount(orderNo) {

    //httpPost
    var result;
    var xhr = new XMLHttpRequest();
    var postData = encodeFormData({
        "pageNum": 1,
        "pageSize": 15,
        "queryMore": false,
        "useCheckcode": false,
        "useOrderInfo": false,
        "errorCheckcode": false,
        "action": "itemlist/SoldQueryAction",
        "prePageNo": 1,
        "orderId": orderNo

    });
    xhr.open("POST", "https://trade.taobao.com/trade/itemlist/asyncSold.htm?event_submit_do_query=1&_input_charset=utf8", true);
    xhr.setRequestHeader("accept", "application/json, text/javascript, */*; q=0.01");
    xhr.setRequestHeader("accept-language", "zh-CN,zh;q=0.9");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    //json数据转化为字符串
    //xhr.send(JSON.stringify(postData));
    xhr.send(postData);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = xhr.responseText;
                // console.log(result);
                var data = JSON.parse(result).mainOrders;
                // console.log("data:" + data);
                var json = extractingData(data);
                // console.log(json);
                if (json.length > 0) {
                    sendMessage({"msgType": "salesOrders", "orders": json}, function (response) {
                    });
                }

            }
        }
    };
    // clearInterval(interval);
}


