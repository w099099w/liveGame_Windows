//请求顺序requestBeting->requestLookCard->requestOpenCard->requestSettleMent(被动调用);
let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.reset();
}
M.reset = function(){
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
    this.tempArr = [];
    this.RoomState = null;
    this.requestState();
}
M.start = function(){
   
}
M.autoOpenCard = function(){
    if(this.RoomState !== RoomState.ROOM_SEE_CARD){
        this.frame.common.toast.show('非看牌状态不可看牌,请稍后!');
        return;
    }
    if(!this.frame.view.base.home.checkAllCardIslooked()){
        this.o = true;
    }
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
M.onMessage = function(data){
    if(this.close){
       return;
    }
    if(data && data.type === G.GAME[G.USER.choose_gameID].id){
        let state = data.stage;
        switch(state){
            case RoomState.ROOM_START_BET:this.frame.view.base.home.setStateText('押注倒计时: '+data.countdown);break;
            case RoomState.ROOM_CONFIRM_OPEN:this.frame.view.base.home.setStateText('开牌倒计时: '+data.countdown);break;
            case RoomState.ROOM_SETTLEMENT:this.frame.view.base.home.setStateText('结算倒计时:'+data.countdown);break;
            case RoomState.ROOM_STOP_BET:this.frame.view.base.home.setStateText('停止押注');break;
            case RoomState.ROOM_END:this.frame.view.base.home.setStateText('结束倒计时: '+data.countdown);break;
        }
        //庄家发送控制
        if(state === RoomState.ROOM_START_BET && data.countdown === 0){
            this.requestBankerInfo();
            this.frame.common.toast.show('停止押注!',false);
        }
        //游戏结束时间为0重置牌面
        if(state === RoomState.ROOM_END && data.countdown === 0){
            this.frame.view.base.home.resetCard();//状态变为游戏结束重置牌
        }
        //状态过滤显示
        if(this.roomStateStr && this.roomStateStr[state] && state !== RoomState.ROOM_CONFIRM_OPEN && state !== RoomState.ROOM_START_BET && data.countdown === 0){
            this.frame.view.base.home.setStateText(this.roomStateStr[state]);
        }
       
        //状态控制
        if(state === RoomState.ROOM_SETTLEMENT && data.countdown !== 0){
            return;
        }
        this.setBetButton(state);
        //翻牌
        if(state === RoomState.ROOM_SEE_CARD){
            this.frame.view.base.home.setFoucs(true);
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
M.setBetButton = function(stateCode){
    switch(Number(stateCode)){
        case RoomState.ROOM_CONFIRM_OPEN:this.frame.view.base.home.setBetButtonState(BetState.STATE_NOOPENCARD);break//看牌倒计时也不可点击确认开牌
        case RoomState.ROOM_NOT_OPEN:this.frame.view.base.home.setBetButtonState(BetState.STATE_NOOPENROOM);break//房间未开变为开始押注但不可点击
        case RoomState.ROOM_SHUFFLE:this.frame.view.base.home.setBetButtonState(BetState.STATE_BET);break;//开始押注激活
        case RoomState.ROOM_START_BET:this.frame.view.base.home.setBetButtonState(BetState.STATE_BETING);break;//和倒计时同时下发开始压注显示压注中
        case RoomState.ROOM_SEE_CARD:this.frame.view.base.home.setBetButtonState(BetState.STATE_NOOPENCARD);break; //请求成功变为确认开牌('所有牌开完自动变为确认开牌,由看牌函数lookCard调用')
        case RoomState.ROOM_SETTLEMENT:this.requestSettleMent();break;//调用结算接口
    }
    this.RoomState = Number(stateCode);
}
/**@description 进入主场景时请求游戏状态*/
M.requestState = function(){
    G.NETWORK.request('get','/dealer/game/status',{},null,(success)=>{
        if(success.code === 200){
            if(this.roomStateStr && this.roomStateStr[success.data.gameStatus]){
                this.frame.view.base.home.setStateText(this.roomStateStr[success.data.gameStatus]);//设置状态显示
                this.setBetButton(success.data.gameStatus);//设置按键状态
                this.RoomState = Number(success.data.gameStatus);
                if(success.data.gameStatus === RoomState.ROOM_NOT_OPEN){
                    this.close = true;
                }else{
                    this.close = false;
                }
                //变更输入状态
                if(success.data.gameStatus === RoomState.ROOM_SEE_CARD){
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
    G.NETWORK.request('post','/dealer/game/wash',{},null,(success)=>{
        this.frame.common.toast.show('游戏开始!',false);
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  	
}
/**@description 游戏开始时点击开始下注的网络请求*/
M.requestBeting = function(){
    G.NETWORK.request('post','/dealer/game/betting',{},null,(success)=>{
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
    G.NETWORK.request('post','/dealer/game/watching',requestData,null,(success)=>{
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
    G.NETWORK.request('post','/dealer/game/open',{},null,(success)=>{
        this.frame.common.toast.show('开牌成功!',false);
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  
}
/**@description 倒计时结束后进行游戏结算网络请求*/
M.requestSettleMent = function(){
    G.NETWORK.request('post',G.USER.choose_gameID ===  0?'/foo/sg/settle':'/foo/pair/settle',{},null,(success)=>{
        this.frame.common.toast.show('结算完成!',false);
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    },null,G.NETWORK.SPEICALHTTP);
}
/**@description 关闭自动开始网络请求*/
M.requestGameEnd = function(requestData){
    G.NETWORK.request('post','/dealer/game/gameover',requestData,null,(success)=>{
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
M.onDestroy = function(){
    if(this.timer){
        clearInterval(this.timer);
        this.timer = null;
    }
}
M.addEvent = function(){

}
export default M;