let M = {};
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        parent:cc.find('common',frame.node),
        rootNode:cc.find('common/dialog',frame.node),
        root:cc.find('common/dialog/root',frame.node),
        mask:cc.find('common/dialog/mask',frame.node),
        tittle:cc.find('common/dialog/root/tittle',frame.node).getComponent(cc.Label),
        icon:cc.find('common/dialog/root/content/icon',frame.node).getComponent('switchsp'),
        label:cc.find('common/dialog/root/content/value',frame.node).getComponent(cc.Label),
        button_yes:cc.find('common/dialog/root/button_layout/button_confirm',frame.node),
        button_no:cc.find('common/dialog/root/button_layout/button_cancle',frame.node),
    };
    this.reset();
    this.addEvent();
};
M.reset = function(){
    this.node.label.fontSize = 30;
    this.node.label.lineHeight = 30;
    this.node.root.scaleY = 0;
    this.node.parent.active = true;
    this.node.mask.active = false;
    this.node.root.active = false;
    this.node.icon.setSpriteFrame(-1);
    this.node.label.string = '';
    this.node.tittle.string = '';
    this.node.button_no.active = false;
    this.node.button_yes.active = false;
    this.queenData = [];
    this.unlock = true;
}
M.push = function(tittle,iconID,label,buttonStyle,callback,parms){
    if(typeof tittle === 'string' && typeof iconID === 'number' && typeof label === 'string' && typeof buttonStyle === 'number'){
        let calclabel = '';
        for(let i = 0; i < label.length;++i){
            switch(i){
                case 17:
                case 32:
                case 45:
                case 56:calclabel+=label[i];calclabel+='\n';break;//换行
                case 62:calclabel+='...';i=label.length;break;//长度限制
                default:calclabel+=label[i];
            }
        }
        this.queenData.push({
            tittle:tittle,
            label:calclabel,
            iconID:iconID,
            buttonStyle:buttonStyle,
            callback:callback,
            parms:parms
        });
        this.show();
    }
}
M.show = function(){
    if(this.unlock){
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.unlock = false;//上锁
        this.node.rootNode.active = true;
        this.node.mask.active = true;
        this.node.root.active = true;
        let curData = this.queenData.shift();
        if(curData){
            this.curBuStyle = curData.buttonStyle;
            this.curCallBack = curData.callback;
            this.curParms = curData.parms;
            this.node.tittle.string = curData.tittle;
            this.node.label.string = curData.label;
            this.node.icon.setSpriteFrame(curData.iconID);
            if(curData.iconID == -1 ){
                this.node.icon.node.width = this.node.icon.node.height = 0;
            }
            switch(this.curBuStyle){
                case DIALOG.MB_YES:this.node.button_yes.active = true;break;
                case DIALOG.MB_YESNO:this.node.button_yes.active = true;this.node.button_no.active = true;break;
            }
            cc.tween(this.node.root).to(0.2,{scaleY:1},{easing:'quadIn'}).start();
        } 
    }
   
}
M.onKeyDown = function(event){
    if(event.keyCode == 89){
        this.result(DIALOG.MB_YES);
    }else if(event.keyCode == 78){
        this.result(DIALOG.MB_NO);
    }
}
M.hide = function(){
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.tween(this.node.root).to(0.2,{scaleY:0},{easing:'quadOut'}).call(()=>{
        this.node.icon.setSpriteFrame(-1);
        this.node.label.string = '';
        this.node.tittle.string = '';
        this.node.button_no.active = false;
        this.node.button_yes.active = false;
        this.node.root.active = false;
        this.curBuStyle = null;
        this.curCallBack = null;
        this.curParms = null;
        this.unlock = true;//解锁
        if(this.queenData.length === 0){
            this.node.mask.active = false;
            this.node.rootNode.active = true;
        }else{
            this.show();
        }
    }).start();
}
M.result = function(touchCode){
    if(this.curCallBack){
        if(this.curBuStyle === DIALOG.MB_YESNO){
            switch(touchCode){
                case DIALOG.MB_YES:
                case DIALOG.MB_NO:this.curCallBack({ctrl:touchCode,params:this.curParms});break;
            }
        }else if(this.curBuStyle === DIALOG.MB_NO && touchCode === DIALOG.MB_NO){
            this.curCallBack({ctrl:touchCode,params:this.curParms})
        }else if(this.curBuStyle === DIALOG.MB_YES && touchCode === DIALOG.MB_YES){
            this.curCallBack({ctrl:touchCode,params:this.curParms})
        }else if(this.curBuStyle === DIALOG.MB_GET && touchCode === DIALOG.MB_GET){
            this.curCallBack({ctrl:touchCode,params:this.curParms})
        }
    }
    this.hide(); 
}
M.addEvent = function(){
    this.node.button_yes.on('touchend',()=>{
        this.result(DIALOG.MB_YES);
    },this);
    this.node.button_no.on('touchend',()=>{
        this.result(DIALOG.MB_NO);
    },this);
}
export default M;