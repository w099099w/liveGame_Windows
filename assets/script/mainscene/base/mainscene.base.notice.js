let M = function() {
    let prototype = null;
    let frame = null;
    let node = null;
    let config = {};
    let noticeData = [];
    let timer = null;
    let scrolling = false;
    let _init = function(component,frame){
        prototype = component;
        frame = frame;
        node = {
            root:cc.find('top/notice',frame.node),
            bgNode:cc.find('top/notice',frame.node),
            labelNode:cc.find('top/notice/bg/mask/label',frame.node),
            noticeLabel:cc.find('top/notice/bg/mask/label',frame.node).getComponent(cc.Label),
        }
        noticeData = [];
        _reset();
    }
    let _reset = function() {
        noticeData = [];
        config = {
            lenth:8,//信息条数限制
            speed:1,//滚动速度
            allLoop:false,//全部信息是否循环播放
            curFlag:-1,//播放下标
        }
        scrolling = false;
        node.root.active = false;
        node.noticeLabel.string = '';
    }
    let _loopMessage = function(string){
        if(!string){
            return false;
        }
        _cleanData();
        _setMessageAllLoop(true);
        _addText(string);
        return true;
    }
    let _cleanData = function(){
        noticeData = [];
        _show();
    }
    let _setMessageNum = function(num){
        if(num > 0 && num != config.length && num < noticeData.length){
            config.length = num;
            noticeData = noticeData.slice(0,num-1);
            return true;
        }
        return false;
    }
    let _setMessageSpeed = function(num){
        if(config.speed !== num &&config.speed > 0){
            config.speed = Math.round(num);
            return true; 
        }
        return false;
    }
    let _setMessageAllLoop = function(bool){
        if(typeof bool === 'boolean'){
            config.allLoop = bool;
            return true;
        }
        return false;
    }
    let _addText = function(str){
        if(typeof str !== 'string' || !str ||noticeData.length === config.length){
            return false;
        }
        noticeData.push(str);//推入数据
        _show(); 
        return true;
    }
    let _show = function(){
        if(scrolling){
            return;//运行状态
        }
        node.labelNode.x = node.bgNode.width/2+20;
        //是否循环滚动
        if(!config.allLoop){
            config.curFlag = -1;//重置游标
            if(noticeData.length == 0){
                console.log('没数据关闭');
                _hide();
                return;
            }
            node.noticeLabel.string = noticeData.shift();//取第一个;
        }else{
            config.curFlag += 1;
            if(config.curFlag == noticeData.length){
                config.curFlag = 0;
            }
            node.noticeLabel.string = noticeData[config.curFlag];  
        }
        _sroll_Notice();
    }
    let _sroll_Notice = function(){
        scrolling = true;//标记运行状态
        node.root.active = true;
        let moveLength = (node.bgNode.width/2 + node.labelNode.width +20)
        node.labelNode.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.01,cc.v2(-config.speed,0)),
                    cc.callFunc(()=>{
                        if(node.labelNode.x < -moveLength){
                            node.labelNode.stopAllActions()
                            scrolling = false;
                            _show();
                        }
                    }),
                )
            )
        );
    }
    let _hide = function(){
        timer = setTimeout(()=>{
            timer = null;
            node.root.active = false;
            node.noticeLabel.string = '';
        },300); 
    }
    let _addEvent = function(){

        
    }
    let _onDestroy = function() {
        node.labelNode.stopAllActions();
        if(timer != null){
            clearTimeout(timer);
            timer = null;
            _reset();
        }
    }
    //暴露的函数或属性
    return {
      init:_init,
      setMessageNum:_setMessageNum,
      setMessageSpeed:_setMessageSpeed,
      setMessageAllLoop:_setMessageAllLoop,
      cleanData:_cleanData,
      addText:_addText,
      loopMessage:_loopMessage,
      onDestroy:_onDestroy,
    }
  } ();
export default M;