let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        parent:cc.find('common',frame.node),
        mask:cc.find('common/mask',frame.node),
        root:cc.find('common/loading',frame.node),
        label:cc.find('common/loading/label',frame.node).getComponent(cc.Label),
        pic:cc.find('common/loading/sprite',frame.node).getComponent(cc.Animation)
    }
    this.sceneName = null;
    this.reset()
}
M.reset = function(){
    this.node.label.string = '';
    this.node.parent.active = true;
    this.node.mask.active = false;
    this.node.root.active = false;
    this.node.pic.play();
}
 /**
  * @description: 传入字符串显示,若无回调函数且无时间则一直显示,若无回调函数则到时间关闭
  * @param {string} str 显示的字符串
  * @param {number} time 显示时间毫秒值
  * @param {boolean} ishide 是否执行回调前关闭
  * @param {boolean} maskshow 是否显示黑色遮罩
  * @param {function} callback 回调函数time < 0 time 为null时不支持回调；
  */
M.show = function(str,time = 0,ishide = false,maskshow = true,callback = null){
    if(typeof ishide !== 'boolean' || (typeof callback !== 'function' && callback !== null)){
        console.log(G.TOOL.getCurentTime(),'error参数错误强制返回');
        return;
    }
    this.sceneName = cc.director.getScene().getName();
    if(maskshow){
        this.node.mask.opacity = 220;
    }else{
        this.node.mask.opacity = 0;
    }
    this.node.mask.active = true;
    this.node.root.active = true;
    this.node.label.string = str;
    this.node.pic.pause();
    this.node.pic.resume();
    if(time > 0){
        setTimeout(()=>{
            if(ishide){
                this.hide();
            }
            if(callback){
                callback()
            }
        },time)
    }
}
M.hide = function() {
    if(this.sceneName === cc.director.getScene().getName()){
        this.node.pic.pause();
        this.node.mask.active = false;
        this.node.root.active = false;
    }  
}
export default M;