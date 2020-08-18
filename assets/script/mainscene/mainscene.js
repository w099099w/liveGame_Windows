let frame = {
    common: {
        loading:require('common.loading'),
        toast:require('common.toast'),
        dialog:require('common.dialog'),
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
            tip:require('mainscene.popup.tip')
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
            console.log(G.TOOL.getCurentTime(),'初始化模块'+key);
            this.frame.common[key].init(cc.Component, frame)
        }
        for (let key in frame.view) {
            for (let k in frame.view[key]){
                console.log(G.TOOL.getCurentTime(),'初始化模块'+key+'.'+k);
                this.frame.view[key][k].init(cc.Component, frame)
            }   
        }
        for (let key in frame.logic) {
            console.log(G.TOOL.getCurentTime(),'初始化模块'+key);
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
            this.frame.view.base.notice.addText("THIS SOFTWARE VERSION IS 1.0.8 DESIGNED BY COCOSCREATOR 2020 VER 2.3.2.");
        },2000);
    },
    testButton(){
        this.frame.logic.scene.autoOpenCard();
    },
    toggleButton(){
        this.frame.logic.scene.configState();
    },
    remButton(){
        this.frame.logic.scene.remConfig();
    },
    catchHandle(){
        this.frame.view.base.home.exceptionHandle();
    },
    autoButton(){
        this.frame.logic.scene.autoRun();
    },
    //消息转发器
    onMessage(code,data){
        console.log(G.TOOL.getCurentTime(),'mainscene网络消息(websocket)',code,JSON.stringify(data));
        switch(code){
            case 'game':this.frame.logic.scene.onMessage(data);break;
            default:console.log(G.TOOL.getCurentTime(),'WARING 消息:'+code+" 内容:"+JSON.stringify(data)+" 未设置消息转发!");
        } 
    },
    update (dt) {
        //每帧脚本供给
        for (let key in frame.updata) {
            this.frame.updata[key].updata();
        }
    },
    temp(){
        this.frame.logic.scene.requestExceptionHandle();
    },
    onDestroy(){
        for (let key in frame.onDestroy) {
            this.frame.onDestroy[key].onDestroy();
        }
    },
});
