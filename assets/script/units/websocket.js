/**
 * webSocket
 */
var webSocket = {}

webSocket.create = function(url,loading) {
    this.reset();
    if(loading){
        this.loading = loading;
    }
    if(!this.reconnect){
        this.loading.show('正在检查服务器连接...',false,false);
    }
    if (this.ws == null && url != null) {
        console.log(G.TOOL.getCurentTime(),"创建连接",G.NETWORK.WS+'/?old_client_id='+(G.NETWORK.clientID?G.NETWORK.clientID:'0'));
        this.ws = new WebSocket(G.NETWORK.WS+'/?old_client_id='+(G.NETWORK.clientID?G.NETWORK.clientID:'0'));
        this.ws.onopen = this.onopen.bind(this);//绑定回调
        this.ws.onmessage = this.onMessage.bind(this);//绑定消息
        this.ws.onerror = this.onError.bind(this);//绑定错误
        this.ws.onclose = this.onClose.bind(this);//绑定关闭
        this.reconnect = true;//开启自动重连
    }
}

webSocket.onopen = function(){
  console.log(G.TOOL.getCurentTime(),'连接ws服务器成功==========')
  this.sendTimer = true;
  if(G.NETWORK.isHeartBeat){
    if(!G.NETWORK.heart_Time > 0){
        console.log(G.TOOL.getCurentTime(),"您已开启心跳但时间设置不合法,请设置为大于0" + "  当前值"+G.NETWORK.heart_Time);
        return;
    }
    G.NETWORK.heartbeat_ID = setInterval(()=>{
      if(this.sendTimer){
          this.sendTimer = false;
      }else{
        clearInterval(G.NETWORK.heartbeat_ID);
        G.NETWORK.heartbeat_ID = null;
        this.loading.show('正在重连服务器...',false,false);
        this.close(true);
        return;
      }
      this.send('keep',{action:'keep',data:'ping'});
    },G.NETWORK.heart_Time*1000);
  }
}
/**
 * 重置
 */
webSocket.reset = function() {
    console.log(G.TOOL.getCurentTime(),"重置网络消息队列==========")
    if (this.reconnect != true) {
        this.reconnect = false
    }
    if(this.ws){
      this.ws.close();
      this.ws = null;
    }
    this.queue.lock = false
    this.queue.data = []
}
 /**
  * @description: 获取当前websock连接的状态
  * @return int [0正在链接中 ,1已经链接并且可以通讯 ,2连接正在关闭 ,3连接已关闭或者没有链接成功]
  */
webSocket.state = function(){
    if(this.ws != null){
        return this.ws.readyState;
    }else{
        return 3;
    }
   
}
 /**
  * @description: 发送消息(连接状态正常,code,data不为null)
  * @param {string} 消息码(不为null)
  * @param {any} 消息内容(不为null)
  */
webSocket.send = function(code, data) {
    if (this.ws != null && this.ws.readyState == 1 && code != null && data != null) {
        var msg = { code: code, data: data }
        console.log(G.TOOL.getCurentTime(),msg, 'send==========')
        this.ws.send(JSON.stringify(msg))
    }
}

/**
 * 主动强制关闭连接;
 */
webSocket.close = function(isreconnect = false) {
    console.log(G.TOOL.getCurentTime(),'主动关闭连接==========')
    this.reconnect = isreconnect;
    this.ws.close();
}
//关闭连接处理函数
webSocket.closeFunction = function(){
    if(!this.reTimer){
        this.closeTime = new Date();
    }
    this.ws = null;
    console.log(G.TOOL.getCurentTime(),this.reconnect?"已开启断线重连":"未开启断线重连")
    if(G.NETWORK.isHeartBeat && G.NETWORK.heartbeat_ID){
        clearInterval(G.NETWORK.heartbeat_ID);
        G.NETWORK.heartbeat_ID = null;
    }
    if (this.reconnect == true && !this.reTimer) {
        this.reTimer = setInterval(()=>{
            this.loading.show('正在重连服务器...',false,false);
            if(new Date() - this.closeTime < (G.NETWORK.reconnectTime*1000)){
                return;
            }
            clearInterval(this.reTimer);
            this.reTimer = null;
            this.create.bind(this);
            this.create(G.NETWORK.WS);
        },500) 
    }
}
webSocket.isJsonStr = function(str){
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return obj;
            }else{
                return false;
            }
        } catch(e) {
            console.log(G.TOOL.getCurentTime(),'error：'+str+'!!!不是JSON 字符串'+e);
            return false;
        }
    }
    return false;
}
/**
 * 网络消息
 */
webSocket.onMessage = function(event) {
    let msg = this.isJsonStr(event.data);
    if(msg){
        if(msg.code === 'keep'){
            console.log(G.TOOL.getCurentTime(),'准许保持连接');
           this.sendTimer = true;
           return;
        }else if(msg.code === 'init'){
            const token = cc.sys.localStorage.getItem('token');
            if(G.NETWORK.clientID && token){
              G.NETWORK.request('post','/control/game/reconnect',{client_id:String(msg.data.info),old_client_id:String(G.NETWORK.clientID)});
            }
            G.NETWORK.clientID = msg.data.info;
            this.loading.hide();
            return;
        }
      console.log(G.TOOL.getCurentTime(),"websocket过滤网络消息==========");
      this.queue.push(msg)//推送到队列
    } 
}

/**
 * 连接错误
 */
webSocket.onError = function(event) {
    console.log(G.TOOL.getCurentTime(),'onError==========')
}


/**
 * 连接被动关闭
 */
webSocket.onClose = function(event) {
    console.log(G.TOOL.getCurentTime(),'网络关闭==========')
    this.closeFunction();
}

/**
 * 消息队列
 */
webSocket.queue = {
    lock: false,
    data: [],
    push:function(msg){
        this.data.push(msg);
        this.run();//若还有消息继续转发
    },
    run: function() {
        if (this.data.length > 0 && this.lock == false) {
            this.lock = true
            var msg = this.data.shift()
            webSocket.gameMessage(msg.code, msg.data)
            this.unlock();//若还有消息继续转发
        }
    },
    unlock: function() {
        this.lock = false
        this.run()
    }
}
