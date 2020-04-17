let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        parent:cc.find('popup',frame.node),
        mask:cc.find('popup/mask',frame.node),
        root:cc.find('popup/quit',frame.node),
        tipLabel:cc.find('popup/quit/label',frame.node).getComponent(cc.Label),
        button_close:cc.find('popup/quit/button_close',frame.node),
        button_confirm:cc.find('popup/quit/button_confirm',frame.node),
        button_cancle:cc.find('popup/quit/button_cancle',frame.node)
    }
    this.reset();
    this.addEvent();
}
M.reset = function(){
    this.node.parent.active = true;
    this.node.mask.active = false;
    this.node.root.active = false;
}
M.show = function(str){
    this.node.tipLabel.string = str?str:'您确定退出游戏吗?';
    this.node.mask.active = true;
    this.node.root.active = true;
}
M.hide = function(){
    this.node.mask.active = false;
    this.node.root.active = false;
}
M.request = function(){
    //网络请求
    G.NETWORK.request('get','/dealer/logout');
    this.frame.common.loading.show('正在退出登录...',1000,false,true,()=>{
        cc.sys.localStorage.removeItem('token');
        cc.director.loadScene('passport');
    })
}
M.addEvent = function(){
    this.node.button_cancle.on('touchend',()=>{
        this.hide();
    },this);
    this.node.button_close.on('touchend',()=>{
        this.hide();
    },this);
    this.node.button_confirm.on('touchend',()=>{
        this.request();
    },this);
}
export default M;