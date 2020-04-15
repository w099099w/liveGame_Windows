let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        root:cc.find('login',frame.node),
        input_phone:cc.find('login/input_phone/input',frame.node).getComponent(cc.EditBox),
        input_password:cc.find('login/input_password/input',frame.node).getComponent(cc.EditBox),
        input_gameID:cc.find('login/input_gameid/combobox',frame.node).getComponent('ComboBox'),
        button_login:cc.find('login/button_login',frame.node),
        button_showSet:cc.find('login/button_setting',frame.node),
        tip:cc.find('login/tip',frame.node),
    }
    this.reset();
    this.addEvent();
}
M.reset = function(){
    //初始化游戏列表选择
    this.choose_gameID = null;
    this.gameList = [];
    G.GAME.forEach((item)=>{
        this.gameList.push(item.game_name);
    },this);
    this.node.input_gameID.init(this.gameList,false,(index)=>{
        this.choose_gameID = index;
    });
    this.node.root.active = false;
}
M.show = function(){
    this.node.root.active = true;
}
M.hide = function(){
    this.node.root.active = false;
}
M.request = function(){
    if(this.node.input_phone.string.length === 0){
        G.TOOL.editError(this.node.tip,"请输入帐号");
        return;
    }else if(this.node.input_password.string.length  === 0){
        G.TOOL.editError(this.node.tip,"请输入密码");
        return;
    }else if(this.choose_gameID  === null){
        G.TOOL.editError(this.node.tip,"请输选择游戏");
        return;
    }
    let requestData ={
        input_gameID:Number(this.choose_gameID),
        input_password:this.node.input_password.string,
        input_phone:this.node.input_phone.string,
    }
    console.log('登录请求数据',requestData);
    this.frame.common.loading.show('正在加载...',1000,false,true,()=>{
        cc.director.loadScene('mainScene');
    });
}
M.addEvent = function(){
    this.node.button_login.on('touchend',()=>{
        this.request();
    },this);
    this.node.button_showSet.on('touchend',()=>{
        this.frame.view.popup.setting.show();
    },this);
}
export default M;