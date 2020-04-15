let frame = {
    common: {
        loading:require('common.loading'),
        toast:require('common.toast'),
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
        //按指定顺序初始化脚本
        this.frame = frame;
        this.frame.node = this.node;
        this.init();
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
        this.frame.view.base.login.show();
    },
    onMessage(code,data){
        console.log('passport网络消息(websocket)',code,data);
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
