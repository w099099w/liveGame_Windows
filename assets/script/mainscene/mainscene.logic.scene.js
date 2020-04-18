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
    this.RoomState = null;
    this.requestState();
}
M.start = function(){
   
}
M.onMessage = function(data){
   if(this.close){
       return;
   }
    if(data && data.type === G.GAME[G.USER.choose_gameID].id){
        let state = data.stage;
        console.log('游戏状态',this.roomStateStr[state]);
        switch(state){
            case RoomState.ROOM_START_BET:this.frame.view.base.home.setStateText('下注倒计时: '+data.countdown);break;
            case RoomState.ROOM_CONFIRM_OPEN:this.frame.view.base.home.setStateText('开牌倒计时: '+data.countdown);break;
            case RoomState.ROOM_STOP_BET:this.frame.view.base.home.setStateText('停止押注');break;
            case RoomState.ROOM_END:this.frame.view.base.home.setStateText('结束倒计时: '+data.countdown);break;
        }
        //游戏结束时间为0重置牌面
        if(state === RoomState.ROOM_END && data.countdown === 0){
            this.frame.view.base.home.resetCard();//状态变为游戏结束重置牌
        }
        //状态显示
        if(this.roomStateStr && this.roomStateStr[state] && state !== RoomState.ROOM_START_BET && data.countdown === 0){
            this.frame.view.base.home.setStateText(this.roomStateStr[state]);
        }
        //翻牌
        if(state === RoomState.ROOM_SEE_CARD){
            if(data.info.length !== 0){
                this.flushOpenCard(data.info);
            }
        }
        //状态控制
        if(state === RoomState.ROOM_SETTLEMENT && data.countdown !== 0){
            return;
        }
        this.setBetButton(state);
    }     
}
//webSocket刷新所有牌
M.flushOpenCard = function(data){
    let cardLayoutData = JSON.parse(data);
    cardLayoutData.forEach((item)=>{
        let cardValue = item.cards.split(',');
        if(cardValue && Array.isArray(cardValue) && cardValue.length !== 0){
            cardValue.forEach((citem,ckey)=>{
                if(citem != 0){
                    let id = ((item.region-1)*3+ckey+1);
                    if(id < 10){
                        id = String('0'+id);
                    }
                    console.log(id);
                    let card_number = String(id+citem);
                    this.frame.view.base.home.lookCard(card_number,false);
                }
            });
        } 
    })
}
/**@description 设置下注按键状态*/
M.setBetButton = function(stateCode){
    switch(Number(stateCode)){
        case RoomState.ROOM_NOT_OPEN:this.frame.view.base.home.setBetButtonState(BetState.STATE_NOOPENROOM);//房间未开变为开始押注但不可点击
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
                if(success.data.gameStatus === RoomState.ROOM_NOT_OPEN){
                    this.close = true;
                }else{
                    this.close = false;
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
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  	
}
/**@description 游戏开始时点击开始下注的网络请求*/
M.requestBeting = function(){
    G.NETWORK.request('post','/dealer/game/betting',{},null,(success)=>{},(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  
}
/**@description 牌型录入按键绑定进行的网络请求*/
M.requestLookCard = function(requestData){
    G.NETWORK.request('post','/dealer/game/watching',requestData,null,(success)=>{
        if(success.code === 200){
            //this.frame.view.base.home.lookCard(requestData.card_number);//解析牌翻牌
            return; 
        }
    },(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  
}
/**@description 所有牌录入完成后进行的网络请求成功后3秒进行结算请求*/
M.requestOpenCard = function(){
    G.NETWORK.request('post','/dealer/game/open',{},null,(success)=>{},(failed)=>{
        this.frame.common.toast.show(failed.message);
    });  
}
/**@description 倒计时结束后进行游戏结算网络请求*/
M.requestSettleMent = function(){
    G.NETWORK.request('post','/foo/sg/settle',{},null,(success)=>{},(failed)=>{
        this.frame.common.toast.show(failed.message);
    },null,"http://live.go.com");
}
/**@description 关闭自动开始网络请求*/
M.requestGameEnd = function(){
    G.NETWORK.request('post','/dealer/game/gameover',{},null,(success)=>{
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