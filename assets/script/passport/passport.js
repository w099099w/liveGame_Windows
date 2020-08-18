let frame = {
    common: {
        loading:require('common.loading'),
        toast:require('common.toast'),
        loadAtlas:require('mainscene.logic.loadAtlas'),
    },
    view: {
        base:{
            login:require('passport.base.login'),
        },
        popup:{
            setting:require('passport.popup.setting'),
        }
    },
    //切换场景时调用destory的脚本
    onDestroy:{
        setting:require('passport.popup.setting'),
    },
    //每帧调用updata的脚本
    updata:{
    },
}
cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad () {
        //重置标识
        G.NETWORK.clientID = null;
        cc.sys.localStorage.removeItem('token');
        //按指定顺序初始化脚本
        this.frame = frame;
        this.frame.node = this.node;
        this.init();
        //创建websocket
        if(webSocket.state() !== 0){
            webSocket.create(G.NETWORK.WS,this.frame.common.loading);
        }
        webSocket.gameMessage = this.onMessage.bind(this);
        cc.director.preloadScene('mainScene');//预加载主场景;
    },
    init(){
        for (let key in frame.common) {
            this.frame.common[key].init(cc.Component, frame)
        }
        for (let key in frame.view) {
            for (let k in frame.view[key]){
                this.frame.view[key][k].init(cc.Component, frame)
            }   
        }
    },
    start () {
        this.frame.common.loadAtlas.loadAtlas('card','card/card');//预加载牌
        this.frame.view.base.login.show();
    },
    onMessage(code,data){
        console.log(G.TOOL.getCurentTime(),'passport网络消息(websocket)',code,JSON.stringify(data));
        //缓存保存
        if(code = 'game'){
            G.USER.tempData = {
                code:code,
                data:data,
            };
        }
    },
    update (dt) {
        //每帧脚本供给
        for (let key in frame.updata) {
            this.frame.updata[key].updata();
        }
    },
    onDestroy(){
        for (let key in frame.onDestroy) {
            this.frame.onDestroy[key].onDestroy();
        }
    },
});
