let frame = {
    common: {
        loading:require('common.loading'),
        toast:require('common.toast'),
        loadAtlas:require('mainscene.logic.loadAtlas'),
    },
    view: {
        base:{
            notice:require('mainscene.base.notice'),
            home:require('mainscene.base.home'),
        },
        popup:{
            quit:require('mainscene.popup.quit'),
            endGame:require('mainscene.popup.endgame'),
        }
    },
    logic:{
        scene:require('mainscene.logic.scene'),
    },
    //切换场景时调用destory的脚本
    onDestroy:{
        home:require('mainscene.base.home'),
        scene:require('mainscene.logic.scene'),
    },
    //每帧调用updata的脚本
    updata:{
    },
}
cc.Class({
    extends: cc.Component,
    properties: {
        sgListPrefab:{
            tooltip:'三公主预制体',
            default:null,
            type:cc.Prefab,
        },
        pairListPrefab:{
            tooltip:'对子主预制体',
            default:null,
            type:cc.Prefab,
        },
    },

    onLoad () {
        //按指定顺序初始化脚本
        this.frame = frame;
        this.frame.gamePrefab = G.USER.choose_gameID === 0?this.sgListPrefab:this.pairListPrefab;//传入主预制体
        this.frame.node = this.node;
        this.init();
        webSocket.gameMessage = this.onMessage.bind(this);
    },
    init(){
        for (let key in frame.common) {
            console.log('初始化模块'+key);
            this.frame.common[key].init(cc.Component, frame)
        }
        for (let key in frame.view) {
            for (let k in frame.view[key]){
                console.log('初始化模块'+key+'.'+k);
                this.frame.view[key][k].init(cc.Component, frame)
            }   
        }
        for (let key in frame.logic) {
            console.log('初始化模块'+key);
            this.frame.logic[key].init(cc.Component, frame)
        }
    },
    start () {
        //缓存取出
        if(G.USER.tempData){
            this.onMessage(G.USER.tempData.code,G.USER.tempData.data);
            G.USER.tempData = null;
        }
        this.frame.logic.scene.start();
        setTimeout(()=>{
            this.frame.view.base.notice.addText("这是一个通知的测试用于测试可用性");
        },2000);
    },
    testButton(){
        this.frame.logic.scene.autoOpenCard();
    },
    //消息转发器
    onMessage(code,data){
        console.log('passport网络消息(websocket)',code,JSON.stringify(data));
        switch(code){
            case 'game':this.frame.logic.scene.onMessage(data);break;
            default:console.log('WARING 消息:'+code+" 内容:"+JSON.stringify(data)+" 未设置消息转发!");
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
