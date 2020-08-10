//请求顺序requestBeting->requestLookCard->requestOpenCard->requestSettleMent(被动调用);
let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        toggle:cc.find('config/toggle',frame.node).getComponent(cc.Toggle),
        configLay:cc.find('config/inputlayout',frame.node),
        remButton:cc.find('config/rember',frame.node).getComponent(cc.Toggle),
    }
    this.closeInput = false;
    this.node.toggle.isChecked = false;
    this.node.configLay.active = false;
    this.node.remButton.node.active = false;
    this.cardCodeArr = cc.sys.localStorage.getItem('remConfig')?JSON.parse(cc.sys.localStorage.getItem('remConfig')):[];
    this.node.remButton.isChecked = cc.sys.localStorage.getItem('isRem')?true:false;
    this.reset();
    this.addEvent();
}
M.reset = function(){
    this.catche = false;
    this.frame.view.base.home.hideCountDown();
    this.frame.view.base.home.resetCard();
    this.roomStateStr = [
        '未在游戏中',
        '房间未开',
        '洗牌中',
        '开始押注',//被动
        '停止押注',
        '看牌中',
        '确认开牌',//被动
        '结算中',
        '本局结束',
    ]
    for(let i = 0; i < this.node.configLay.children.length;++i){
        //设置数据显示
        if(this.cardCodeArr[i]){
            this.node.configLay.children[i].getChildByName('input').getComponent(cc.EditBox).string = this.cardCodeArr[i];
        }else{
            this.node.configLay.children[i].getChildByName('input').getComponent(cc.EditBox).string = '';
        }  
        if(G.USER.choose_gameID === 1 && i > 7){
            this.node.configLay.children[i].active = false;
        }else{
            this.node.configLay.children[i].active = true;
        }
    }
    this.tempArr = [];
    this.RoomState = null;
    this.requestState();
}
M.start = function(){
   
}
M.configState = function(){
    this.toggleState = this.node.toggle.isChecked;
    this.node.configLay.active = this.toggleState;
    this.node.remButton.node.active = this.toggleState;
    if(this.toggleState){
        this.checkCardcode();
    }
}
M.remConfig = function(){
    if(!this.node.remButton.isChecked){
        cc.sys.localStorage.removeItem('remConfig');
    }
    if(this.node.remButton.isChecked){
        cc.sys.localStorage.setItem('isRem',1);
    }else{
        cc.sys.localStorage.removeItem('isRem');
    }
}
M.checkCardcode = function(){
    //采集数据
    for(let i = 0; i < (G.USER.choose_gameID == 0?18:8);++i){
        let cardCode = this.node.configLay.children[i].getChildByName('input').getComponent(cc.EditBox).string;
        if(cardCode.length === 4){
            this.cardCodeArr[i] = this.node.configLay.children[i].getChildByName('input').getComponent(cc.EditBox).string;
        }
    }
    if(this.node.remButton.isChecked){
        cc.sys.localStorage.setItem('remConfig',JSON.stringify(this.cardCodeArr));
    }
    //校验数据
    for(let i = 0; i < (G.USER.choose_gameID == 0?18:8);++i){
        let cardCode = this.node.configLay.children[i].getChildByName('input').getComponent(cc.EditBox).string;
        if(cardCode === '' || cardCode.length < 4 || !G.TOOL.cardValueToName(Number(cardCode.substr(1)/10),cardCode.substr(0,1))){
            this.node.configLay.children[i].getChildByName('isok').active = true;
        }else{
            this.node.configLay.children[i].getChildByName('isok').active = false;
        }
    }
    //处理重复数据
    let sameIndex = this.SameOut(this.cardCodeArr)
    for(let i = 0; i < sameIndex.length;++i){
        this.node.configLay.children[sameIndex[i]].getChildByName('isok').active = true;
    }
}
M.isOkConfig = function(){
    for(let i = 0; i < (G.USER.choose_gameID == 0?18:8);++i){
        if(this.node.configLay.children[i].getChildByName('isok').active){
            return false;
        }
    }
    return true;
}
M.SameOut = function(arr){
    let key;
    let i = 0;
    let repeatID = [];
    while(i<=arr.length){ 
        key = arr[i];
        for(k=i+1;k<=arr.length;k++){
            if(key==arr[k]){
                repeatID.push(i,k);
            }       
        }
        i++; 
    }
    return repeatID;
}
M.autoOpenCard = function(){
    if(this.RoomState !== RoomState.ROOM_SEE_CARD){
        this.frame.common.toast.show('非看牌状态不可看牌,请稍后!');
        return;
    }
    if(!this.frame.view.base.home.checkAllCardIslooked()){
        this.o = true;
    }
    if(this.toggleState){
        if(this.isOkConfig()){
            let id = this.frame.view.base.home.calcTempID();
            if(id == -1){
                return;
            }
            id = id < 10?String('0'+id):String(id);
            let cardCode = this.cardCodeArr[Number(id)-1];
            let requestData = {
                card_number:String(id+cardCode),
            }
            console.log('自动翻牌码:'+requestData.card_number);
            this.requestLookCard(requestData);
        }else{
            this.frame.common.toast.show('请先修正错误!',false);
            return;
        }
    }else{
        let cardValue = '';
        do{
            let id = this.frame.view.base.home.calcTempID();
            if(id == -1){
                return;
            }
            id = id < 10?String('0'+id):String(id);
            let cardColor = Math.round(Math.random()*5)+5;
            if(G.USER.choose_gameID == 1){
                do{
                    cardColor = Math.round(Math.random()*5)+5;
                }while(cardColor == 9 || cardColor == 10);
            }
            if(cardColor == 9){
                cardValue  = id + String(1000);
            }else if(cardColor == 10){
                cardValue  = id + String(2000);
            }else{
                cardValue  = id+String(cardColor);
                let card_number = Math.round(Math.random()*12)+1;
                if(G.USER.choose_gameID === 1){
                    do{
                        card_number = Math.round(Math.random()*12)+1;
                    }while(card_number > 10);
                }
                card_number = card_number < 10?String('0'+(card_number*10)):String(card_number*10);
                cardValue += card_number;
            }
            if(cardValue.length !== 6){
                console.log('数据错误:'+cardValue);
            }
            
        }while(this.tempArr.includes(cardValue.substr(2,4)));
        this.tempArr.push(cardValue.substr(2,4));
        let requestData = {
            card_number:cardValue
        }
        console.log('自动翻牌码:'+cardValue);
        this.requestLookCard(requestData);
    }
}
M.onMessage = function(data){
    if(this.close){
       return;
    }
    if(data && data.type === G.GAME[G.USER.choose_gameID].id){
        let state = data.stage;
        switch(state){
            case RoomState.ROOM_START_BET:{this.catche = true;this.frame.view.base.home.setStateText('押注倒计时: '+data.countdown);this.frame.view.base.home.setCountDown(data.countdown)};break;
            case RoomState.ROOM_CONFIRM_OPEN:{this.catche = true;this.frame.view.base.home.setStateText('开牌倒计时: '+data.countdown)};break;
            case RoomState.ROOM_SETTLEMENT:{this.catche = true;this.frame.view.base.home.setStateText('结算倒计时:'+data.countdown)};break;
            case RoomState.ROOM_STOP_BET:this.frame.view.base.home.setStateText('停止押注');break;
            case RoomState.ROOM_END:this.frame.view.base.home.setStateText('结束倒计时: '+data.countdown);break;
        }
        //庄家发送控制
        if(state === RoomState.ROOM_START_BET && data.countdown === 0){
            this.requestBankerInfo();
            G.AUDIO.instance.playEffectFromLocal(EFFECTS.EFF_STOPBET);
            this.frame.common.toast.show('停止押注!',false);
        }
        //游戏结束时间为0重置牌面
        if(state === RoomState.ROOM_END && data.countdown === 0){
            this.reset();//状态变为游戏结束重置牌
        }
        //状态过滤显示
        if(this.roomStateStr && this.roomStateStr[state] && state !== RoomState.ROOM_CONFIRM_OPEN && state !== RoomState.ROOM_START_BET && data.countdown === 0){
            this.frame.view.base.home.setStateText(this.roomStateStr[state]);
        }
       
        //状态控制
        if(state === RoomState.ROOM_SETTLEMENT && data.countdown !== 0){
            return;
        }
        this.setBetButton(state,data.countdown);
        //翻牌
        if(state === RoomState.ROOM_SEE_CARD){
            if(data.info.length !== 0){
                this.flushOpenCard(data.info);
            }
        }
    }     
}
//webSocket刷新所有牌
M.flushOpenCard = function(data){
    let cardLayoutNum = G.USER.choose_gameID === 0?3:2;
    let cardLayoutData = JSON.parse(data);
    cardLayoutData.forEach((item)=>{
        let cardValue = item.cards.split(',');
        if(cardValue && Array.isArray(cardValue) && cardValue.length !== 0){
            cardValue.forEach((citem,ckey)=>{
                if(citem != 0){
                    let id = ((item.region-1)*cardLayoutNum+ckey+1);
                    if(id < 10){
                        id = String('0'+id);
                    }
                    let card_number = String(id+citem);
                    this.frame.view.base.home.lookCard(card_number,false);
                }
            });
        } 
    })
    if(this.o){
        setTimeout(()=>{
            if(this.frame.view.base.home.checkAllCardIslooked()){
                this.tempArr = [];
                this.o = false;
                return;
            }
            this.autoOpenCard();
        },1000);
    }
}
/**@description 设置下注按键状态*/
M.setBetButton = function(stateCode,countdown = -1){
    switch(Number(stateCode)){
        case RoomState.ROOM_STOP_BET:if(typeof countdown != 'undefined' && countdown == 0){this.frame.view.base.home.setBetButtonState(BetState.START_CARD); this.closeInput = true;this.frame.view.base.home.setFoucs(false);};break//开始开牌按钮
        case RoomState.ROOM_CONFIRM_OPEN:this.frame.view.base.home.setBetButtonState(BetState.STATE_NOOPENCARD);break//看牌倒计时也不可点击确认开牌
        case RoomState.ROOM_NOT_OPEN:this.frame.view.base.home.setBetButtonState(BetState.STATE_NOOPENROOM);break//房间未开变为开始押注但不可点击
        case RoomState.ROOM_SHUFFLE:this.frame.view.base.home.setBetButtonState(BetState.STATE_BET);break;//开始押注激活
        case RoomState.ROOM_START_BET:this.frame.view.base.home.setBetButtonState(BetState.STATE_BETING);break;//和倒计时同时下发开始压注显示压注中
        case RoomState.ROOM_SEE_CARD:if(!this.closeInput)this.frame.view.base.home.setBetButtonState(BetState.STATE_NOOPENCARD);break; //请求成功变为确认开牌('所有牌开完自动变为确认开牌,由看牌函数lookCard调用')
        case RoomState.ROOM_SETTLEMENT:this.requestSettleMent();break;//调用结算接口
    }
    this.RoomState = Number(stateCode);
}
/**@description 进入主场景时请求游戏状态*/
M.requestState = function(){
    console.log("请求游戏状态");
    G.NETWORK.request('get','/control/game-room/status',{},null,(success)=>{
        if(success.code === 200){
            if(this.roomStateStr && this.roomStateStr[success.data.status]){
                this.frame.view.base.home.setStateText(this.roomStateStr[success.data.status]);//设置状态显示
                this.setBetButton(success.data.status);//设置按键状态
                this.RoomState = Number(success.data.status);
                if(success.data.status === RoomState.ROOM_NOT_OPEN){
                    this.close = true;
                }else{
                    this.close = false;
                }
                //变更输入状态
                if(success.data.status === RoomState.ROOM_SEE_CARD){
                    this.frame.view.base.home.setFoucs(true);
                }else{
                    this.frame.view.base.home.setFoucs(false);
                }
            }
            return; 
        }
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  	
}
/**@description 开始游戏*/
M.requestStartGame = function(){
    this.close = false;
    G.NETWORK.request('post','/control/game/wash',{},null,(success)=>{
        this.frame.common.toast.show('游戏开始!',false);
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  	
}
/**@description 游戏开始时点击开始下注的网络请求*/
M.requestBeting = function(){
    G.NETWORK.request('post','/control/game/betting',{},null,(success)=>{
        G.AUDIO.instance.playEffectFromLocal(EFFECTS.EFF_STARTBET);
        this.frame.common.toast.show('开始押注!',false);
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  
}
/**@description 倒计时结束后进行游戏结算网络请求*/
M.requestBankerInfo= function(){
    G.NETWORK.request('post',G.USER.choose_gameID === 0?'/foo/sg/banker':'/foo/pair/banker',{},null,(success)=>{
        console.log('请求庄家信息返回');
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    },null,G.NETWORK.SPEICALHTTP);
}
/**@description 牌型录入按键绑定进行的网络请求*/
M.requestLookCard = function(requestData){
    if(this.RoomState !== RoomState.ROOM_SEE_CARD){
        this.frame.common.toast.show('非看牌状态不可看牌,请稍后!');
        return;
    }
    G.NETWORK.request('post','/control/game/watching',requestData,null,(success)=>{
        console.log(success)
        this.frame.common.toast.show('开牌成功!',false);
    },(failed)=>{
        this.o = false;
        this.frame.view.base.home.node.cardCode.string = '';
        this.frame.view.base.home.setFoucs(true);
        this.frame.common.toast.show(failed.message);
    });
}
/**@description 所有牌录入完成后进行的网络请求成功后3秒进行结算请求*/
M.requestOpenCard = function(){
    G.NETWORK.request('post','/control/game/open',{},null,(success)=>{
        this.frame.common.toast.show('开牌成功!',false);
        this.catche = true;
        this.frame.view.base.home.node.button_catche.comp.interactable = false;
        this.frame.view.base.home.node.button_catche.label.string = '取消结算';
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  
}
/**@description 倒计时结束后进行游戏结算网络请求*/
M.requestSettleMent = function(){
    G.NETWORK.request('post',G.USER.choose_gameID ===  0?'/foo/sg/settle':'/foo/pair/settle',{},null,(success)=>{
        this.frame.common.toast.show('结算完成!',false);
        setTimeout(()=>{
            if(cc.director.getScene().getName() == 'mainScene'){
                this.requestBroadcast();
            }
        },3000);
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    },null,G.NETWORK.SPEICALHTTP);
}
M.requestBroadcast = function(){
    G.NETWORK.request('post','/foo/room/win/broadcast',{},null,(success)=>{
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    },null,G.NETWORK.SPEICALHTTP);
}
/**@description 关闭自动开始网络请求*/
M.requestGameEnd = function(requestData){
    G.NETWORK.request('post','/control/game/over',requestData,null,(success)=>{
        if(success.code == 200){
            this.frame.common.toast.show('操作已成功!');
            this.frame.view.popup.endGame.hide();
            this.close = true;
            this.frame.view.base.home.setBetButtonState(BetState.STATE_NOOPENROOM);
            this.frame.view.base.home.setStateText(this.roomStateStr[RoomState.ROOM_NOT_OPEN]);
            this.frame.view.base.home.resetCard();//状态变为游戏结束重置牌
        }
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });
}
M.requestExceptionHandle = function(){
    G.NETWORK.request('post','/foo/abnormal/settle/'+String(G.USER.choose_gameID+1),{},null,(success)=>{
        if(success.code == 0){
           this.reset();
        }
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    },null,G.NETWORK.SPEICALHTTP);
}
M.onDestroy = function(){
    if(this.timer){
        clearInterval(this.timer);
        this.timer = null;
    }
}
M.addEvent = function(){
    for(let i = 0; i < this.node.configLay.children.length;++i){
        this.node.configLay.children[i].getChildByName('input').on('editing-did-ended',this.checkCardcode.bind(this));
    }
}
export default M;