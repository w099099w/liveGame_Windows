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
    this.show();
    this.resetCard();
}
M.resetCard = function(){
    if(!this.node.playerList){
        this.inistancePlayerList();
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
    if(event.keyCode == G.USER.keyBind.cin){
        this.requestReadCard();
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
M.openCard = function(cardCode){
    let id = Number(cardCode.substr(0,2))-1;//除法向下取整减一
    let cardLayoutNum = G.USER.choose_gameID === 0?3:2;
    if(id < 0 || id > G.GAME[G.USER.choose_gameID].region * cardLayoutNum-1){
        return;
    }

    let areaID = Math.floor(id/cardLayoutNum);
    let targetID = id%cardLayoutNum;
    
    if(this.node.playerList && this.node.playerList[areaID] && this.node.playerList[areaID].getChildByName('cardlayout').children[targetID]){
        let targetNode = this.node.playerList[areaID].getChildByName('cardlayout').children[targetID];
        if(targetNode.getComponent(cc.Sprite).spriteFrame.name !== 'base'){
            this.frame.common.toast.show('牌已翻开过,数据错误!序号:'+areaID+'下标:'+targetID);
            return;
        }
        let cardColor = Number(cardCode.substr(2,1));
        let cardNum = Number(cardCode.substr(3,3))/10;
        let cardName = G.TOOL.cardValueToName(cardNum,cardColor);
        console.log('翻开的牌值',cardName);
        if(cardName){
            targetNode.runAction(cc.sequence(cc.scaleTo(0.2, 0, 1), cc.scaleTo(0.2, 1, 1),cc.callFunc(()=>{
                targetNode.getComponent(cc.Sprite).spriteFrame = this.frame.common.loadAtlas.getSpriteFrame('card',cardName);
            })),this);
            this.node.cardCode.string = '';
        }
    }

}
M.hide = function(){
}
M.requestReadCard = function(){
    if(this.node.cardCode.string.length === 0){
        this.frame.common.toast.show('清输入需要识别的牌型编号');
        return;
    }else if(this.node.cardCode.string.length !== 6){
        this.frame.common.toast.show('输入牌型编号长度不正确');
        return;
    }
    //网络请求识别牌成功后翻起
    this.openCard(this.node.cardCode.string);
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
M.addEvent = function(){
    this.node.quit_show.on('touchend',()=>{
        this.frame.view.popup.quit.show();
    },this);
    this.node.endgame_show.on('touchend',()=>{
        this.frame.view.popup.endGame.show();
    },this);
}
export default M;