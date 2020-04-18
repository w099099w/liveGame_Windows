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
    this.node.root.active = true;
    this.gameList = [];
    G.NETWORK.request('get','/dealer/category',{},null,(success)=>{
        if(success.code === 200){
            G.GAME = success.data;
            G.GAME.forEach((item)=>{
                this.gameList.push(item.game_name);
            },this);
            this.node.input_gameID.init(this.gameList,false,(index)=>{
                this.choose_gameID = index;
            });
            return; 
        }
    },(failed)=>{
        if(webSocket.state == 1){
            this.frame.common.toast.show(failed.message);
        } 
    });  
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
    if(!G.NETWORK.clientID){
        this.frame.common.toast.show('未获取到客户端ID,请重启游戏后再试');
        return;
    }
    let requestData ={
        game:String(G.GAME[Number(this.choose_gameID)].id),
        password:this.node.input_password.string,
        name:this.node.input_phone.string,
        client_id:String(G.NETWORK.clientID),
    }
    G.NETWORK.request('post','/dealer/login',requestData,this.frame.common,(success)=>{
        if(success.code === 200){
            if(success.data){
                cc.sys.localStorage.setItem('token',success.data.token);
                this.frame.common.loading.show('正在加载...',1000,false,true,()=>{
                    G.USER.choose_gameID = Number(this.choose_gameID);
                    cc.director.loadScene('mainScene');
                });
            }
        }
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    })
    
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