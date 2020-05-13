let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
    this.node = {
        stateText:cc.find('top/state/bg/value',frame.node).getComponent(cc.Label),
        cardCode:cc.find('buttom/readcard/input',frame.node).getComponent(cc.EditBox),
        gameName:cc.find('top/gameLable',frame.node).getComponent(cc.Label),
        quit_show:cc.find('top/button_quit',frame.node),
        endgame_show:cc.find('buttom/button_gameend',frame.node),
        mainNode:cc.find('home',frame.node),
        button_gameStart:cc.find('buttom/button_gamestart',frame.node),
        button_beting:{
            root:cc.find('buttom/button_betorbeting',frame.node),
            comp:cc.find('buttom/button_betorbeting',frame.node).getComponent(cc.Button),
            label:cc.find('buttom/button_betorbeting/Background/value',frame.node).getComponent(cc.Label)
        },
        playerList:null,
        gamePrefab:frame.gamePrefab,
    }
    this.reset();
    this.addEvent();
}
M.reset = function(){
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
    this.node.mainNode.active = true;
    this.node.mainNode.removeAllChildren();
    this.node.playerList = null;
    this.button_betStateCode = null;
    this.show();
    this.setBetButtonState(BetState.STATE_NOOPENROOM);//初始化押注按钮为开始下注
    this.resetCard();
}
M.resetCard = function(){
    if(!this.node.playerList){
        this.inistancePlayerList();
        return;
    }
    //将牌全置为反面
    this.node.playerList.forEach((item,key) => {
        let id = item.getChildByName('id').getComponent(cc.Label);
        let cardLayout = item.getChildByName('cardlayout').children;
        cardLayout.forEach((citem,ckey)=>{
            citem.stopAllActions();
            citem.getComponent(cc.Sprite).spriteFrame = this.frame.common.loadAtlas.getSpriteFrame('card','base');
        },this);
        id.string = key+1;
    });
}
M.keyDown = function(event){
    console.log('keydownCode'+event.keyCode,'mybindKeycode:'+G.USER.keyBind.cin);
    if(event.keyCode == G.USER.keyBind.cin ||event.keyCode == 13){
        this.checkLookCardData();
    }else if(event.keyCode == G.USER.keyBind.state){
        //向节点发射事假
       this.betButtonDown();
    }
}
M.setStateText = function(str){
    this.node.stateText.string = str;
}
M.show = function(){
    this.node.gameName.string = G.GAME[G.USER.choose_gameID].game_name;
}
M.inistancePlayerList = function(){
    let tempNode = cc.instantiate(this.node.gamePrefab);
    this.node.playerList = tempNode.children;
    tempNode.parent = this.node.mainNode;
    tempNode.active = true;
}
M.lookCard = function(cardCode,isToast = true){
    let id = Number(cardCode.substr(0,2))-1;//除法向下取整减一
    let cardLayoutNum = G.USER.choose_gameID === 0?3:2;
    if(id < 0 || id > G.GAME[G.USER.choose_gameID].region * cardLayoutNum-1){
        return;
    }
    let areaID = Math.floor(id/cardLayoutNum);
    let targetID = id%cardLayoutNum;
    
    if(this.node.playerList && this.node.playerList[areaID] && this.node.playerList[areaID].getChildByName('cardlayout').children[targetID]){
        let targetNode = this.node.playerList[areaID].getChildByName('cardlayout').children[targetID];
        let cardColor = Number(cardCode.substr(2,1));
        let cardNum = Number(cardCode.substr(3,3))/10;
        let cardName = G.TOOL.cardValueToName(cardNum,cardColor);
        targetNode.width = 160;
        targetNode.height = 208;
        if(targetNode.getComponent(cc.Sprite).spriteFrame.name !== 'base'){
            // if(isToast){
            //     this.frame.common.toast.show('牌已翻开过,数据错误!序号:'+areaID+'下标:'+targetID);
            // }
            targetNode.getComponent(cc.Sprite).spriteFrame = this.frame.common.loadAtlas.getSpriteFrame('card',cardName);
            if(this.checkAllCardIslooked()){
                this.setBetButtonState(BetState.STATE_OPENCARD);
                this.setFoucs(false);
                this.node.cardCode.string = '';
            }else{
                this.setFoucs(false);
                this.node.cardCode.string = '';
                this.setFoucs(true);
            }
            return;
        }
        console.log('翻开的牌值',cardName);
        if(cardName){
            targetNode.runAction(cc.sequence(cc.scaleTo(0.2, 0, 1), cc.scaleTo(0.2, 1, 1),cc.callFunc(()=>{
                targetNode.getComponent(cc.Sprite).spriteFrame = this.frame.common.loadAtlas.getSpriteFrame('card',cardName);
                setTimeout(()=>{
                    if(this.checkAllCardIslooked()){
                        this.setBetButtonState(BetState.STATE_OPENCARD);
                        this.setFoucs(false);
                        this.node.cardCode.string = '';
                    }else{
                        this.setFoucs(false);
                        this.node.cardCode.string = '';
                        this.setFoucs(true);
                    }
                },50);
            })),this); 
        }
    }
}
M.hide = function(){
}
M.calcTempID = function(){
    let cardLayoutNum = G.USER.choose_gameID === 0?3:2;
    for(let i = 0; i < this.node.playerList.length;i++){
        let parent = this.node.playerList[i].getChildByName('cardlayout');
        for(let k = 0; k < parent.children.length;k++){
            let item = parent.children[k];
            if(item.getComponent(cc.Sprite).spriteFrame.name === 'base'){
                return i*cardLayoutNum+k+1;
            }
        }
    }
    return -1;
}
M.checkLookCardData = function(){
    if(this.node.cardCode.string.length === 0){
        this.frame.common.toast.show('清输入需要识别的牌型编号');
        return;
    }else if(this.node.cardCode.string.length !== 6){
        this.frame.common.toast.show('输入牌型编号长度不正确');
        return;
    }
    //网络请求识别牌成功后翻起
    let requestData = {
        card_number:this.node.cardCode.string
    }
    this.frame.logic.scene.requestLookCard(requestData);
}
M.checkAllCardIslooked = function()
{
    if(this.node.playerList && Array.isArray(this.node.playerList)){
        for(let i = 0;i < this.node.playerList.length;++i){
            let cardLayout = this.node.playerList[i].getChildByName('cardlayout').children;
            for(let k = 0;k< cardLayout.length;++k){
                if(cardLayout[k].getComponent(cc.Sprite).spriteFrame.name == 'base'){
                    return false;
                }
            }
        }
    }
    return true;
}
M.setBetButtonState = function(BetStateCode){
    switch(BetStateCode){
        case BetState.STATE_NOOPENROOM:{
            this.node.button_beting.comp.interactable = false;
            this.node.button_beting.label.string = '开始押注';
        }break;
        case BetState.STATE_BET:{
            this.node.button_beting.comp.interactable = true;
            this.node.button_beting.label.string = '开始押注';
        }break;
        case BetState.STATE_BETING:{
            this.node.button_beting.comp.interactable = false;
            this.node.button_beting.label.string = '押注中';
        }break;
        case BetState.STATE_OPENCARD:{
            this.node.button_beting.comp.interactable = true;
            this.node.button_beting.label.string = '确认开牌';
        }break;
        case BetState.STATE_NOOPENCARD:{
            this.node.button_beting.comp.interactable = false;
            this.node.button_beting.label.string = '确认开牌';
        }break;
    } 
    this.button_betStateCode =  BetStateCode;
}
M.onDestroy = function(){
    if(this.node.playerList){
        this.node.playerList.forEach((item,key) => {
            if(item.isValid){
                let cardLayout = item.getChildByName('cardlayout').children;
                cardLayout.forEach((citem,ckey)=>{
                    if(citem.isValid){
                        citem.stopAllActions();
                    }
                },this);
            }
        });
    }
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
}
M.setFoucs = function(bool){
    console.log('设置输入状态',this.getFoucs(),bool);
    if(this.getFoucs() !== bool){
        if(bool){
            console.log('可键入');
            this.node.cardCode.focus();
        }else{
            console.log('不可键入');
            this.node.cardCode.blur();
        }  
    } 
}
M.getFoucs = function(){
    return this.node.cardCode.isFocused();
}
M.betButtonDown = function(){
    if(this.button_betStateCode!== null && this.button_betStateCode !== undefined){
        switch(this.button_betStateCode){
            case BetState.STATE_BET:this.frame.logic.scene.requestBeting();break;
            case BetState.STATE_OPENCARD:this.checkAllCardIslooked()?this.frame.logic.scene.requestOpenCard():this.frame.common.toast.show('请先完成所有区域发牌!');break;
        }
    }
}
M.addEvent = function(){
    this.node.quit_show.on('touchend',()=>{
        this.frame.view.popup.quit.show();
    },this);
    this.node.endgame_show.on('touchend',()=>{
        if(this.frame.logic.scene.RoomState === RoomState.ROOM_END || this.frame.logic.scene.RoomState === RoomState.ROOM_SHUFFLE){
            this.frame.view.popup.endGame.show();
        }else if(this.frame.logic.scene.RoomState === RoomState.ROOM_NOT_OPEN){
            this.frame.common.toast.show('没有开始的游戏,不需要结束!');
        }else{
            this.frame.common.toast.show('请等待当前游戏结束!');
        } 
    },this);
    this.node.button_gameStart.on('touchend',()=>{
        if(this.button_betStateCode === BetState.STATE_NOOPENROOM || this.frame.logic.scene.RoomState === RoomState.ROOM_NOT_OPEN){
            this.frame.logic.scene.requestStartGame();
        }else{
            this.frame.common.toast.show('游戏已开始，请勿重复操作!');
        }
    },this);
    this.node.button_beting.root.on('touchend',()=>{
        this.betButtonDown();
    },this);
    this.node.cardCode.node.on('editing-did-began',()=>{
       if(this.frame.logic.scene.RoomState !== RoomState.ROOM_SEE_CARD){
           setTimeout(()=>{
            this.setFoucs(false);
           },30);
       }
    },this);
    this.node.cardCode.node.on('text-changed',()=>{
        if(this.node.cardCode.string.length == 6){
            this.setFoucs(false);
        }
     },this);
}
export default M;