let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        parent:cc.find('popup',frame.node),
        mask:cc.find('popup/mask',frame.node),
        root:cc.find('popup/endgame',frame.node),
        inputPassword:cc.find('popup/endgame/input_password/input',frame.node).getComponent(cc.EditBox),
        button_close:cc.find('popup/endgame/button_close',frame.node),
        button_confirm:cc.find('popup/endgame/button_confirm',frame.node),
        button_cancle:cc.find('popup/endgame/button_cancle',frame.node)
    }
    this.reset();
    this.addEvent();
}
M.reset = function(){
    this.node.parent.active = true;
    this.node.mask.active = false;
    this.node.root.active = false;
}
M.show = function(){
    this.node.inputPassword.string = '';
    this.node.mask.active = true;
    this.node.root.active = true;
}
M.hide = function(){
    this.node.mask.active = false;
    this.node.root.active = false;
}
M.request = function(){
    if(this.node.inputPassword.string.length === 0){
        this.frame.common.toast.show('密码不能为空,请输入!');
        return;
    }
    //网络请求
    let requestData = {
        password:this.node.inputPassword.string,
    }
    this.frame.logic.scene.requestGameEnd(requestData);
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