let M = {}

M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        parent:cc.find('common',frame.node),
        root:cc.find('common/toast',frame.node),
        mask:cc.find('common/toast/mask',frame.node),
        bg:cc.find('common/toast/info/bg',frame.node),
        info:cc.find('common/toast/info',frame.node),
        tipLabel:cc.find('common/toast/info/label',frame.node).getComponent(cc.Label),
    }
    this.reset();
}
M.reset = function(){
  this.node.root.active = false;
  this.node.parent.active = true;
  this.node.info.stopAllActions();
  this.node.mask.active = false;
  this.node.info.active = false;
}
M.show = function(str,isMask = true){
    if(typeof str !== 'string' || typeof isMask !== 'boolean'){
        return;
    }
    this.node.root.active = true;
    this.node.info.stopAllActions();
    this.node.tipLabel.string = str;
    if(cc.ENGINE_VERSION.substring(0,3) === '2.1'){
        this.node.tipLabel._updateRenderData(true);
    }else{
        this.node.tipLabel._forceUpdateRenderData(true);
    }
    this.node.info.opacity = 0;
    this.node.info.active = true;
    let width = this.node.tipLabel.node.width + 80
    let height = this.node.tipLabel.node.height + 30;
    this.node.bg.setContentSize(cc.size(width , height));
    this.node.info.opacity = 255;
    this.node.mask.active = isMask;
    this.node.info.setPosition(cc.v2(0, 0));
    this.node.info.runAction(cc.sequence(
            cc.delayTime(1),
            cc.spawn(cc.moveBy(1, cc.v2(0, 200)),cc.fadeOut(1)),
            cc.callFunc(function() {
            this.node.mask.active = false;
            this.node.info.active = false;
            }, this)
        )
    )
}
export default M;