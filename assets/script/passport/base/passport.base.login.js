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
        isRemember:cc.find('login/remember',frame.node),
        isAgree:cc.find('login/remember/isagree',frame.node),
    }
    this.reset();
    this.addEvent();
}
M.reset = function(){
    //读取配置
    if(cc.sys.localStorage.getItem('remember')){
        this.node.isAgree.active = true;
        let info = JSON.parse(cc.sys.localStorage.getItem('remember'));
        this.node.input_phone.string = info.phone;
        this.node.input_password.string = info.password;
        this.choose_gameID = info.choose_gameID;
    }else{
        this.node.isAgree.active = false;
        this.choose_gameID = null;
    }
    this.node.root.active = true;
    this.gameList = [];
    this.requestGameList();
}
M.requestGameList = function(){
    G.NETWORK.request('get','/control/game/category',{},null,(success)=>{
        if(success.code === 200){
            G.GAME = success.data;
            G.GAME.forEach((item)=>{
                this.gameList.push(item.game_name);
            },this);
            this.node.input_gameID.init(this.gameList,this.choose_gameID === null?false:this.choose_gameID,(index)=>{
                this.choose_gameID = index;
            });
            return; 
        }
    },(failed)=>{
        if(webSocket.state == 1){
            this.frame.common.toast.show(failed.message);
        }
        setTimeout(()=>{
            if(cc.director.getScene().getName() == 'passport'){
                this.frame.common.toast.show("正在重新拉取游戏列表!");
                this.requestGameList();
            }
        },3000); 
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
        this.frame.common.toast.show('未获取到客户端ID,请稍后再试');
        return;
    }
    let requestData ={
        game_type:String(G.GAME[Number(this.choose_gameID)].id),
        password:this.node.input_password.string,
        username:this.node.input_phone.string,
        client_id:String(G.NETWORK.clientID),
    }
    G.NETWORK.request('post','/control/dealer/login',requestData,this.frame.common,(success)=>{
        if(success.code === 200){
            if(success.data){
                cc.sys.localStorage.setItem('token',success.data.token);
                if(this.node.isAgree.active){
                    let info = {
                        phone:this.node.input_phone.string,
                        password:this.node.input_password.string,
                        choose_gameID:this.choose_gameID
                    }
                    cc.sys.localStorage.setItem('remember',JSON.stringify(info));
                }
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
    this.node.isRemember.on('touchend',()=>{
        this.node.isAgree.active = !this.node.isAgree.active;
        if(!this.node.isAgree.active){
            cc.sys.localStorage.removeItem('remember');
        }
    },this);
}
export default M;