let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
}
M.cleanAtlas = function(name){
    if(this.cache){
        //注意调用时机确定没有使用时才
        if(this.cache[name]){
            cc.loader.release(this.cache[name].path);//释放指定缓存
            delete this.cache[name];
        }else{
            for(let key in this.cache){
                cc.loader.release(this.cache[key].path);//释放全部缓存
            }
            this.cache = {};
        }
    }
}
M.loadAtlas = function(name,path,callback = null){
    if(!name || !path ||typeof name !== 'string' || typeof path !== 'string'){
        return;
    }else if(this.cache && this.cache[name] && this.cache[name].path == path){
        console.log(G.TOOL.getCurentTime(),'重复加载图集'+name);
        if(callback){
            callback(null, this.cache[name].atlas);
        }
        return;//重复加载一个图集return;
    }
    if(!this.cache){
        this.cache = {};//定义缓存对象
    }
    cc.loader.loadRes(path, cc.SpriteAtlas, function (err, atlas) {
        if(!err){
            let data = {
                path:path,
                atlas:atlas,
            }
            this.cache[name] = data;
            console.log(G.TOOL.getCurentTime(),'success',name+'加载成功');
        }else{
            console.log(G.TOOL.getCurentTime(),'err',err)
        }
        if(callback){
            callback(err, atlas);
        }
    }.bind(this));
}
M.getSpriteFrame = function(name,spName){
    if(!this.cache[name]){
        return null;
    }
    let spriteFrame = this.cache[name].atlas.getSpriteFrame(spName);
    if(!(spriteFrame instanceof cc.SpriteFrame)){
        return null;
    }
    return spriteFrame;
}
export default M;