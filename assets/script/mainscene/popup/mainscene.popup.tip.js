let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        parent:cc.find('popup',frame.node),
        mask:cc.find('popup/mask',frame.node),
        root:cc.find('popup/tip',frame.node),
        tipLabel:cc.find('popup/tip/label',frame.node).getComponent(cc.Label),
        button_cancle:cc.find('popup/tip/button_cancle',frame.node)
    }
    this.timer = null;
    this.reset();
    this.addEvent();
}
M.reset = function(){
    this.node.parent.active = true;
    this.node.mask.active = false;
    this.node.root.active = false;
}
M.show = function(time){
    if(!this.timer){
        this.node.mask.active = true;
        this.node.root.active = true;
        this.node.tipLabel.string = time+"秒后将自动取消结算!";
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
        this.timer = setInterval(()=>{
            if(cc.director.getScene().getName() == 'mainScene'){
                time--;
                this.node.tipLabel.string = time+"秒后将自动取消结算!";
                if(time == 0){
                    clearInterval(this.timer);
                    this.timer = null;
                    this.frame.logic.scene.requestExceptionHandle();
                    this.hide();
                }
            }else{
                clearInterval(this.timer);
                this.timer = null;
            }
        },1000)
    }
}
M.keyDown = function(event){
    if(event.keyCode == 78){
        this.hide();
    }
}
M.hide = function(){
    if(this.timer){
        clearInterval(this.timer);
        this.timer = null;
    }
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
    this.node.root.active = false;
    this.node.mask.active = false;
}
M.addEvent = function(){
    this.node.button_cancle.on('touchend',()=>{
        this.hide();
    },this);
}
export default M;