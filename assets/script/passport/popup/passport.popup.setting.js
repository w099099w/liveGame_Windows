let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        parent:cc.find('popup',frame.node),
        mask:cc.find('popup/mask',frame.node),
        root:cc.find('popup/setting',frame.node),
        input_resolution:cc.find('popup/setting/resolution/combobox',frame.node).getComponent('ComboBox'),
        input_stateCtrl:cc.find('popup/setting/key/stateCtrl/keyCode',frame.node),
        input_cinCardType:cc.find('popup/setting/key/cinCardType/keyCode',frame.node),
        stateCtrl_Label:cc.find('popup/setting/key/stateCtrl/keyCode/value',frame.node).getComponent(cc.Label),
        cinCardType_Label:cc.find('popup/setting/key/cinCardType/keyCode/value',frame.node).getComponent(cc.Label),
        button_close:cc.find('popup/setting/button_close',frame.node),
        button_quit:cc.find('popup/setting/button_quit',frame.node),
    }
    this.reset();
    this.addEvent();
}
M.reset = function(){
    let keyBind = cc.sys.localStorage.getItem('keyBind')?JSON.parse(cc.sys.localStorage.getItem('keyBind')):{state:9,cin:32};
    G.USER.keyBind = keyBind;
    this.node.stateCtrl_Label.string = this.keyShow(Number(G.USER.keyBind.state));
    this.node.cinCardType_Label.string = this.keyShow(Number(G.USER.keyBind.cin));
    this.node.parent.active = true;
    this.node.mask.active = false;
    this.node.root.active = false;
    if(cc.sys.isNative && CC_JSB){
        this.JScontroller = new ns.JScontroller();//实例化JSB2.0绑定控制
        if(cc.sys.localStorage.getItem('resoultion')){
            this.saveResoultion = JSON.parse(cc.sys.localStorage.getItem('resoultion'));
            if(this.saveResoultion.width == 1920 && this.saveResoultion.height == 1080){
                this.JScontroller.setViewSize(1919,1079,5);
            }else{
                this.JScontroller.setViewSize(this.saveResoultion.width, this.saveResoultion.height,this.saveResoultion.Index);
            }
        }
    }
    this.resolutionList = [];
    G.RESOULTION.forEach(item=>{
        this.resolutionList.push(String(item.width)+'*'+String(item.height));
    },this);
    if(this.saveResoultion){
        G.USER.curResolutionID = this.saveResoultion.Index;
    }
    this.node.input_resolution.init(this.resolutionList,G.USER.curResolutionID,(index)=>{
        G.USER.curResolutionID = index;
        if(cc.sys.isNative && CC_JSB && this.JScontroller){
            if(G.RESOULTION[index].width == 1920 && G.RESOULTION[index].height == 1080){
                this.JScontroller.setViewSize(1919,1079,G.USER.curResolutionID);
            }else{
                this.JScontroller.setViewSize(G.RESOULTION[index].width,G.RESOULTION[index].height,G.USER.curResolutionID);
            }
            let data = {
                width:G.RESOULTION[index].width,
                height:G.RESOULTION[index].height,
                Index:G.USER.curResolutionID,
            }
            cc.sys.localStorage.setItem('resoultion',JSON.stringify(data));
        }
    });
}
M.onDestroy = function() {
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown_state, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown_cinCardType, this);
}
M.keyShow = function(keyCode){
    console.log(keyCode);
    let showString = null;
    switch(keyCode){
        case 8:showString = 'BackSpace';break;
        case 9:showString = 'Tab';break;
        case 13:showString = 'Enter';break;
        case 16:showString = 'Shift';break;
        case 17:showString = 'Ctrl';break;
        case 18:showString = 'Alt';break;
        case 19:showString = 'PauseBreak';break;
        case 20:showString = 'CapsLock';break;
        case 27:showString = 'Esc';break;
        case 32:showString = '空格';break;
        case 33:showString = 'PageUp';break;
        case 34:showString = 'PageDown';break;
        case 35:showString = 'End';break;
        case 36:showString = 'Home';break;
        case 37:showString = '←';break;
        case 38:showString = '↑';break;
        case 39:showString = '→';break;
        case 40:showString = '↓';break;
        case 45:showString = 'Insert';break;
        case 46:showString = 'Delete';break;
        case 91:showString = '左徽标';break;
        case 92:showString = '右徽标';break;
        case 93:showString = '右键菜单';break;
        case 96:showString = 'Num0';break;
        case 97:showString = 'Num1';break;
        case 98:showString = 'Num2';break;
        case 99:showString = 'Num3';break;
        case 100:showString = 'Num4';break;
        case 101:showString = 'Num5';break;
        case 102:showString = 'Num6';break;
        case 103:showString = 'Num7';break;
        case 104:showString = 'Num8';break;
        case 105:showString = 'Num9';break;
        case 106:showString = 'Num*';break;
        case 107:showString = 'Num+';break;
        case 109:showString = 'Num-';break;
        case 110:showString = 'Num.';break;
        case 111:showString = 'Num/';break;
        case 112:showString = 'F1';break;
        case 113:showString = 'F2';break;
        case 114:showString = 'F3';break;
        case 115:showString = 'F4';break;
        case 116:showString = 'F5';break;
        case 117:showString = 'F6';break;
        case 118:showString = 'F7';break;
        case 119:showString = 'F8';break;
        case 120:showString = 'F9';break;
        case 121:showString = 'F10';break;
        case 122:showString = 'F11';break;
        case 123:showString = 'F12';break;
        case 144:showString = 'NumLock';break;
        case 145:showString = 'ScrollLock';break;
        case 188:showString = ',&<';break;
        case 189:showString = '.&>';break;
        case 190:showString = '-&__';break;
        case 191:showString = '/&?';break;
        case 186:showString = ';&:';break;
        case 187:showString = '=&+';break;
        case 192:showString = '~&`';break;
        case 219:showString = '[&{';break;
        case 220:showString = "|";break;
        case 221:showString = ']&}';break;
        case 222:showString = '\'&\"';break;
    }
    return showString?showString:String.fromCharCode(keyCode);
}
M.onKeyDown_state = function(event){
    if(event.keyCode == 27){
        this.frame.common.toast.show('该键已被系统预制!,请重试');
        return;
    }
    if(event.keyCode == G.USER.keyBind.cin){
        this.frame.common.toast.show('不能与牌型录入按键相同,请重新键入!')
        return;
    }
    let showString = this.keyShow(event.keyCode);
    this.node.stateCtrl_Label.string = showString;
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown_state, this);
    let keyBind = {
        state:Number(event.keyCode),
        cin:G.USER.keyBind.cin
    }
    cc.sys.localStorage.setItem('keyBind',JSON.stringify(keyBind));
}
M.onKeyDown_cinCardType = function(event){
    if(event.keyCode == 27){
        this.frame.common.toast.show('该键已被系统预制!,请重试');
        return;
    }
    if(event.keyCode == G.USER.keyBind.state){
        this.frame.common.toast.show('不能与状态控制按键相同,请重新键入!')
        return;
    }
    let showString = this.keyShow(event.keyCode);
    this.node.cinCardType_Label.string = showString;
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown_cinCardType, this);
    let keyBind = {
        state:G.USER.keyBind.state,
        cin:Number(event.keyCode)
    }
    cc.sys.localStorage.setItem('keyBind',JSON.stringify(keyBind));
}
M.show = function(){
    this.node.mask.active = true;
    this.node.root.active = true;
}
M.hide = function(){
    if(this.node.stateCtrl_Label.string === '请键入按键!'){
        this.frame.common.toast.show('请为状态控制设定按键!');
        return;
    }else if(this.node.cinCardType_Label.string === '请键入按键!'){
        this.frame.common.toast.show('请为牌型录入设定按键!');
        return;
    }
    this.node.mask.active = false;
    this.node.root.active = false;
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown_state, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown_cinCardType, this);
}
M.addEvent = function(){
    this.node.input_stateCtrl.on('touchend',()=>{
        if(this.node.cinCardType_Label.string !== '请键入按键!'){
            this.node.stateCtrl_Label.string = '请键入按键!';
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown_state, this);
        }else{
            this.frame.common.toast.show('请为牌型录入设定按键!');
        }
    },this);
    this.node.input_cinCardType.on('touchend',()=>{
        if(this.node.stateCtrl_Label.string !== '请键入按键!'){
            this.node.cinCardType_Label.string = '请键入按键!';
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown_cinCardType, this);
        }else{
            this.frame.common.toast.show('请为状态控制设定按键!');
        }
    },this);
    this.node.button_close.on('touchend',()=>{
        this.hide();
    },this);
    this.node.button_quit.on('touchend',()=>{
        cc.game.end();
    },this);
}
export default M;