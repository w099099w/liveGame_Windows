cc.Class({
    extends:cc.Sprite,
    editor: {
        menu: "渲染组件/switchSp",
        executeInEditMode: true,
        disallowMultiple: true,
    },
    properties: {
        cacheArr:{
            tooltip: CC_DEV && '精灵缓存数组',
            type:[cc.SpriteFrame],
            default:[],
            notify () {
                this._show = false;
                for(let i = 0; i < this.cacheArr.length;++i){
                    if(this.cacheArr[i] && this.cacheArr[i] instanceof cc.SpriteFrame){
                        this._show = true;
                        break;
                    }
                }
                //数组资源补足则刷新显示
                this.curSp = this._curID;
            }
        },
        _curID:-1,//实际控制显示的值
        _show:false,//控制cursp的显示
        curSp:{
            tooltip: CC_DEV && '显示的spriteID(缓存数组的下标)',
            type:cc.Integer,
            get:function(){
                return this._curID;
            },
            set:function(value){
               if(value < -1 || value > this.cacheArr.length-1){
                   return;
               }else{
                   if(cc.isValid(this.node,true)){
                        if(value != -1 && this.cacheArr[value] && this.cacheArr[value] instanceof cc.SpriteFrame){
                            this.spriteFrame = this.cacheArr[value];
                            this._curID = value;
                        }else{
                            this.spriteFrame = null;
                            this._curID = value;
                        }
                   }
               }  
            },
            visible:function(){
                return this._show;
            }
        }
    },
    updateFrame(key,spriteFrame){
        if(key > this.cacheArr.length-1 || !(spriteFrame instanceof cc.SpriteFrame)){
            return false;
        }
        this.cacheArr[key] = spriteFrame;
        return true;
    },
    pushFrame(spriteFrame){
        if(!(spriteFrame instanceof cc.SpriteFrame)){
            return false;
        }else{
            this.cacheArr.push(spriteFrame);
            return this.spriteArr.length-1;
        }
    },
    setSpriteFrame(key){
       this.curSp = key;
    },
    getShowID(){
        return this.curSp;
    },
});
